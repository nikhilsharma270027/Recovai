import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Initialize Pinecone
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});
const indexName = process.env.PINECONE_INDEX_NAME || 'pdf-index';
const namespace = 'medicinereminders';

async function generateEmbeddings(text: string): Promise<number[]> {
    const nvidiaApiKey = process.env.NVIDIA_API_KEY;
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

async function retrieveRelevantDocuments(userId: string, queryEmbedding: number[], topK: number = 3) {
    const index = pinecone.index(indexName);

    // Query Pinecone for similar documents
    const queryResponse = await index.namespace(namespace).query({
        vector: queryEmbedding,
        topK,
        filter: {
            user_id: userId
        },
        includeMetadata: true
    });

    // Extract document information and scores
    const relevantDocs = queryResponse.matches.map(match => ({
        id: match.id,
        fileName: match.metadata?.file_name as string,
        score: match.score,
        userId: match.metadata?.user_id as string,
        content: match.metadata?.content || "" // Some metadata might include content preview
    }));

    return relevantDocs;
}

async function generateChatResponse(query: string, documents: Array<{ fileName: string, content: string, score: number }>) {
    try {
        // Prepare document references
        const docContext = documents.map(doc =>
            `Document: ${doc.fileName} (Relevance: ${(doc.score * 100).toFixed(1)}%)\n${doc.content}`
        ).join('\n\n');

        const prompt = `As a medical assistant, provide a helpful, accurate response to the user's health query. 
Base your response ONLY on the information in the provided documents.
If the information isn't in the documents, clearly state that you don't have that specific information.

Relevant Medical Documents:
${docContext}

User Query: ${query}

Respond in a conversational, empathetic tone. Prioritize accuracy and cite which document contains the information.
DO NOT make up medical information not contained in the documents. you can give `;

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
            temperature: 0.2, // Lower temperature for factual responses
            maxTokens: 800,
        });

        return {
            response: result.text,
            sourceDocs: documents.map(doc => doc.fileName)
        };
    } catch (error) {
        console.error('Error generating chat response:', error);
        throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        // Log the raw request body for debugging
        const body = await req.json();
        console.log('Request body:', body);

        const { query, user_id } = body;

        // Validate inputs
        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        if (!user_id || typeof user_id !== 'string') {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Generate embeddings for the query
        const queryEmbedding = await generateEmbeddings(query);

        // Retrieve relevant documents from Pinecone
        const relevantDocs = await retrieveRelevantDocuments(user_id, queryEmbedding);

        if (relevantDocs.length === 0) {
            return NextResponse.json({
                message: 'No relevant documents found for your query. Please upload your medical reports first or try a different question.',
                documents: []
            }, { status: 200 });
        }



        // Generate chat response based on the query and documents
        const chatResponse = await generateChatResponse(query, relevantDocs);

        return NextResponse.json({
            response: chatResponse.response,
            documents: chatResponse.sourceDocs,
            relevance_scores: relevantDocs.map(doc => ({
                document: doc.fileName,
                score: doc.score
            }))
        }, { status: 200 });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({
            error: 'Failed to process chat request',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}