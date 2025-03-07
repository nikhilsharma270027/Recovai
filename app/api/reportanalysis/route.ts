import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { customInitApp } from '@/lib/firebase-admin-config';
import * as pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { Pinecone } from '@pinecone-database/pinecone';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Initialize Firebase Admin
customInitApp();
const bucket = getStorage().bucket('fruitsinmug.appspot.com');

// Initialize Pinecone
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});
const indexName = process.env.PINECONE_INDEX_NAME || 'pdf-index';
const namespace = 'medicinereminders'; // Optional namespace

async function generateEmbeddings(text: string): Promise<number[]> {
    const nvidiaApiKey = process.env.NVIDIA_API_KEY; // Get API Key
    if (!nvidiaApiKey) {
        throw new Error("NVIDIA_API_KEY environment variable not set.");
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nvidiaApiKey}`,
        },
        body: JSON.stringify({
            input: [text],
            model: "nvidia/embed-qa-4",
            input_type: "query",
            encoding_format: "float",
            truncate: "NONE",
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("NVIDIA API Error:", errorData);
        throw new Error(`NVIDIA API failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0 || !data.data[0].embedding) {
        throw new Error('Invalid response format from NVIDIA API');
    }

    return data.data[0].embedding;
}

async function generateHealthInsights(pdfText: string, fileName: string): Promise<string> {
    try {
        const currentDate = new Date().toISOString().split('T')[0];

        const prompt = `Analyze the following medical report text and generate concise, actionable health insights in JSON format. Structure the insights as follows:
  
        {
          "file_name": "${fileName}",
          "analyzed_on": "${currentDate}",
          "insights": [
            {
              "insight": "Insight 1",
              "confidence": "Confidence Percentage%"
            },
            {
              "insight": "Insight 2",
              "confidence": "Confidence Percentage%"
            },
            {
              "insight": "Insight 3",
              "confidence": "Confidence Percentage%"
            }
          ]
        }
  
        Medical Report Text: ${pdfText}`;


        const result = await generateText({
          model: google('gemini-1.5-flash'),
            messages: [
                {
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: prompt
                    }],
                },
            ],
        });
        return result.text;
    } catch (error) {
        console.error('Error generating health insights:', error);
        throw new Error(`Failed to generate health insights: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, user_id } = await req.json();

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'File name is required' }, { status: 400 });
        }

        if (!user_id || typeof user_id !== 'string') {
            return NextResponse.json({ error: 'File user_id is required' }, { status: 400 });
        }

        const file = bucket.file(`reportanalysis/${user_id}/${name}`);
        const [exists] = await file.exists();

        if (!exists) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const [fileBuffer] = await file.download();

        if (!fileBuffer || fileBuffer.length === 0) {
            return NextResponse.json({ error: 'File is empty or corrupted' }, { status: 500 });
        }

        let pdfData;
        try {
            // Add validation for PDF header
            const pdfHeader = fileBuffer.slice(0, 5).toString('ascii');
            if (pdfHeader !== '%PDF-') {
                return NextResponse.json({
                    error: 'Invalid PDF file format',
                    details: 'File does not appear to be a valid PDF'
                }, { status: 400 });
            }

            pdfData = await pdfParse(fileBuffer, {
                // Add parsing options to handle some malformed PDFs
                max: 0, // No page limit
                version: 'default'
            });

            if (!pdfData || !pdfData.text) {
                return NextResponse.json({
                    error: 'Failed to extract text from PDF',
                    details: 'No text content found in the PDF'
                }, { status: 500 });
            }

        } catch (pdfError) {
            console.error('PDF parsing error:', pdfError);
            return NextResponse.json({
                error: 'Failed to parse PDF file',
                details: pdfError instanceof Error ? pdfError.message : String(pdfError)
            }, { status: 500 });
        }

        console.log('Extracted PDF text length:', pdfData.text.length);

        // Generate Embeddings
        try {
            const embeddings = await generateEmbeddings(pdfData.text);
            console.log('Embeddings:', embeddings);
            // Upsert to Pinecone
            try {
                const index = pinecone.index(indexName);

                await index.namespace(namespace).upsert([
                    {
                        id: name, // Use the file name as the ID
                        values: embeddings,
                        metadata: {
                            user_id: user_id,
                            file_name: name,
                            content: pdfData.text,  // <--- ADD THIS LINE!
                        },
                    },
                ]);
                try {
                    const healthInsights = await generateHealthInsights(pdfData.text, name);
                    let structuredData;
                    try {
                      let jsonContent = healthInsights;
                      const match = jsonContent.match(/```json\n([\s\S]*?)\n```/);
                      if (match) {
                          jsonContent = match[1].trim();
                      } else {

                          jsonContent = jsonContent.trim();
                      }

                      const lastBrace = jsonContent.lastIndexOf('}');
                      if (lastBrace !== -1) {
                          jsonContent = jsonContent.substring(0, lastBrace + 1);
                      }
                      console.log( jsonContent);
                      structuredData = JSON.parse(jsonContent);
                    } catch (parseError) {
                      console.error('Error parsing LLM response:', parseError);
                      return NextResponse.json({
                        text: pdfData.text,
                        error: 'Failed to parse LLM response'
                      }, { status: 500 });
                    }
                    return NextResponse.json({ message: 'PDF processed and saved to Pinecone', structuredData }, { status: 200 });
                } catch (geminiError) {
                    console.error('Gemini Error:', geminiError);
                    return NextResponse.json({ message: 'PDF processed and saved to Pinecone', error: 'Failed to generate structured data from Gemini', details: geminiError instanceof Error ? geminiError.message : String(geminiError) }, { status: 206 });
                }
            } catch (pineconeError) {
                console.error('Pinecone Error:', pineconeError);
                return NextResponse.json({ error: 'Failed to save to Pinecone', details: pineconeError instanceof Error ? pineconeError.message : String(pineconeError) }, { status: 500 });
            }

        } catch (embeddingError) {
            console.error('Embedding Error:', embeddingError);
            return NextResponse.json({ error: 'Failed to generate embeddings', details: embeddingError instanceof Error ? embeddingError.message : String(embeddingError) }, { status: 500 });
        }
    } catch (error) {
        console.error('Error extracting data from PDF:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}