import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, activity_type, activity_title, activity_data } = body;

        if (!user_id || !activity_type || !activity_title) {
            return NextResponse.json({
                error: 'Missing required fields: user_id, activity_type, activity_title'
            }, { status: 400 });
        }

        // Store activity in Firebase
        const activityRef = collection(db, 'users', user_id, 'activities');
        const docRef = await addDoc(activityRef, {
            type: activity_type,
            title: activity_title,
            data: activity_data || {},
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            activityId: docRef.id,
            message: 'Activity recorded successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Activity storage error:', error);
        return NextResponse.json({
            error: 'Failed to store activity',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const limitCount = parseInt(searchParams.get('limit') || '10');
        const activityType = searchParams.get('type');

        if (!userId) {
            return NextResponse.json({
                error: 'User ID is required'
            }, { status: 400 });
        }

        // Build query
        const activityRef = collection(db, 'users', userId, 'activities');
        let activityQuery = query(
            activityRef,
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        // Filter by type if specified
        if (activityType) {
            activityQuery = query(
                activityRef,
                where('type', '==', activityType),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );
        }

        const querySnapshot = await getDocs(activityQuery);
        const activities = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().createdAt)
        }));

        return NextResponse.json({
            activities,
            count: activities.length
        }, { status: 200 });

    } catch (error) {
        console.error('Activity fetch error:', error);
        return NextResponse.json({
            error: 'Failed to fetch activities',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}