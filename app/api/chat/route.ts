import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebaseConfig';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

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
            model: "nvidia/llama-3.2-nv-embedqa-1b-v2",
            input_type: "query",
            encoding_format: "float",
            truncate: "NONE",
            dimensions: 1024,
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
        Base your response on the information in the provided documents. If the information isn't in the documents, use your general medical knowledge to provide a helpful response.
    
        Relevant Medical Documents:
        ${docContext}
    
        User Query: ${query}
    
        Respond in a conversational, empathetic tone. Prioritize accuracy and cite which document contains the information if applicable.
        If the information isn't in the documents, provide a general response based on common medical knowledge.  only text form md format use the informat avaialbe and give user what he asks based on the user uploaded reports, dont specify anything else and dont give doctor consultation suggestions`;

        const ai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
            config: {
                temperature: 0.5,
                maxOutputTokens: 800,
            },
        });

        const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

        return {
            response: responseText,
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
            // Generate a general response even without documents
            const ai = new GoogleGenAI({
                apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
            });

            const generalResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `As a medical assistant, provide a helpful general response to this health query: "${query}". 
                                Since no specific medical reports are available, provide general medical information and advice. 
                                Keep the response conversational and helpful. Always recommend consulting with healthcare professionals for specific medical advice.`,
                            },
                        ],
                    },
                ],
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                },
            });

            const responseText = generalResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

            return NextResponse.json({
                response: responseText,
                documents: [],
                message: 'Response based on general medical knowledge. For personalized advice, please upload your medical reports.'
            }, { status: 200 });
        }

        ////////////
        // Ensure content is always a string
const formattedDocs = relevantDocs.map((doc) => ({
    id: doc.id,
    fileName: doc.fileName,
    score: doc.score ?? 0, // If score is undefined, set it to 0
    userId: doc.userId,
    content: String(doc.content), // Ensure content is a string
  }));
        /////////

        // Generate chat response based on the query and documents
        const chatResponse = await generateChatResponse(query, formattedDocs);

        // Store chat conversation in Firebase
        try {
            const chatRef = collection(db, 'users', user_id, 'conversations');
            await addDoc(chatRef, {
                userMessage: query,
                aiResponse: chatResponse.response,
                documents: chatResponse.sourceDocs,
                relevanceScores: relevantDocs.map(doc => ({
                    document: doc.fileName,
                    score: doc.score
                })),
                timestamp: serverTimestamp(),
                createdAt: new Date().toISOString()
            });
        } catch (firebaseError) {
            console.error('Failed to store conversation in Firebase:', firebaseError);
            // Continue even if storage fails
        }

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



