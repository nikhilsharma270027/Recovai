import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { customInitApp } from '@/lib/firebase-admin-config';
import * as pdfParse from 'pdf-parse/lib/pdf-parse.js';
// import * as pdfParse from 'pdf-parse';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Initialize Firebase Admin
customInitApp();
const bucket = getStorage().bucket('fruitsinmug.appspot.com');

function validateStructuredResponse(response: any) {
  return Array.isArray(response?.medications) && response.medications.every((med: any) => {
    return med.name && med.dosage && med.frequency && med.duration && med.instructions;
  });
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

    const file = bucket.file(`medicinereminders/${user_id}/${name}`);
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

    try {
      const prompt = `Extract and present the medical information from the provided document in a structured format. 
      important note: these are compalsory fields and the structure should be followed as it is.
      The structure should follow this example (respond only with the JSON object, no other text or formatting):

      {
        "medications": [
          {
            "name": "Paracetamol",
            "dosage": "500mg",
            "frequency": "Twice a day",
            "duration": "5 days",
            "instructions": "Take after food"
            "time_of_day": "Morning"
          },
          {
            "name": "Vitamin D",
            "dosage": "1000 IU",
            "frequency": "Once a day",
            "duration": "30 days",
            "instructions": "Take in the morning"
             "time_of_day": "Evening"
          }
        ],
        "recommendations": [
          "Drink plenty of water",
          "Avoid heavy physical activity"
        ]
      }

      Document content: ${pdfData.text}`;

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

      let structuredData;
      try {
        // Remove markdown code blocks and any trailing content
        let jsonContent = result.text;
        // First, try to extract content between ```json and ``` if present
        const match = jsonContent.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
            jsonContent = match[1].trim();
        } else {
            // If no code blocks, just clean up the string
            jsonContent = jsonContent.trim();
        }
        // Remove any trailing non-JSON content
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

      if (!validateStructuredResponse(structuredData)) {
        console.error('Invalid LLM structured output:', structuredData);
        return NextResponse.json({
          text: pdfData.text,
          error: 'Invalid structured output from LLM'
        }, { status: 500 });
      }

      return NextResponse.json({
        text: pdfData.text,
        structuredData
      }, { status: 200 });

    } catch (aiError) {
      console.error('Error querying Gemini:', aiError);
      return NextResponse.json({
        text: pdfData.text,
        error: 'Failed to get structured data from Gemini',
        details: aiError instanceof Error ? aiError.message : String(aiError)
      }, { status: 206 });
    }

  } catch (error) {
    console.error('Error extracting data from PDF:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}