import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, exercise_id, exercise_name, reps_completed, target_reps, accuracy, duration_minutes, feedback } = body;

        if (!user_id || !exercise_id || !exercise_name) {
            return NextResponse.json({
                error: 'Missing required fields: user_id, exercise_id, exercise_name'
            }, { status: 400 });
        }

        // Store therapy session in Firebase
        const therapyRef = collection(db, 'users', user_id, 'therapysessions');
        const docRef = await addDoc(therapyRef, {
            exerciseId: exercise_id,
            exerciseName: exercise_name,
            repsCompleted: reps_completed || 0,
            targetReps: target_reps || 0,
            accuracy: accuracy || 0,
            durationMinutes: duration_minutes || 0,
            feedback: feedback || '',
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString(),
            completed: true
        });

        return NextResponse.json({
            success: true,
            sessionId: docRef.id,
            message: 'Therapy session recorded successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Therapy session storage error:', error);
        return NextResponse.json({
            error: 'Failed to store therapy session',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

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

        // Fetch therapy sessions from Firebase
        const therapyRef = collection(db, 'users', userId, 'therapysessions');
        const therapyQuery = query(
            therapyRef,
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(therapyQuery);
        const sessions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().createdAt)
        }));

        // Calculate weekly stats
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weeklySessions = sessions.filter(session => 
            new Date(session.timestamp) >= oneWeekAgo
        );

        const weeklyStats = {
            sessionsCompleted: weeklySessions.length,
            totalMinutes: weeklySessions.reduce((sum, session: any) => sum + (session.durationMinutes || 0), 0),
            averageAccuracy: weeklySessions.length > 0 
                ? Math.round(weeklySessions.reduce((sum, session: any) => sum + (session.accuracy || 0), 0) / weeklySessions.length)
                : 0
        };

        return NextResponse.json({
            sessions: sessions.slice(0, limitCount),
            weeklyStats,
            totalSessions: sessions.length
        }, { status: 200 });

    } catch (error) {
        console.error('Therapy sessions fetch error:', error);
        return NextResponse.json({
            error: 'Failed to fetch therapy sessions',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}