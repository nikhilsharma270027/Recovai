import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const limitCount = parseInt(searchParams.get('limit') || '50');

        if (!userId) {
            return NextResponse.json({
                error: 'User ID is required'
            }, { status: 400 });
        }

        // Fetch chat history from Firebase
        const chatRef = collection(db, 'users', userId, 'conversations');
        const chatQuery = query(
            chatRef,
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(chatQuery);
        const conversations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().createdAt)
        }));

        return NextResponse.json({
            conversations: conversations.reverse(), // Reverse to show oldest first
            count: conversations.length
        }, { status: 200 });

    } catch (error) {
        console.error('Chat history fetch error:', error);
        return NextResponse.json({
            error: 'Failed to fetch chat history',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}