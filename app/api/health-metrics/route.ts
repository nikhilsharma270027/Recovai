import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, heart_rate, blood_pressure, weight, steps } = body;

        if (!user_id) {
            return NextResponse.json({
                error: 'User ID is required'
            }, { status: 400 });
        }

        // Store health metrics in Firebase
        const healthMetricsRef = doc(db, 'users', user_id, 'healthmetrics', 'latest');
        
        // Get previous data to calculate trends
        const previousData = await getDoc(healthMetricsRef);
        let trends = {
            heartRateTrend: 'stable',
            bloodPressureTrend: 'stable',
            weightTrend: 'stable',
            stepsTrend: 'stable'
        };

        if (previousData.exists()) {
            const prev = previousData.data();
            trends = {
                heartRateTrend: heart_rate > prev.heartRate ? 'up' : heart_rate < prev.heartRate ? 'down' : 'stable',
                bloodPressureTrend: blood_pressure > prev.bloodPressure ? 'up' : blood_pressure < prev.bloodPressure ? 'down' : 'stable',
                weightTrend: weight > prev.weight ? 'up' : weight < prev.weight ? 'down' : 'stable',
                stepsTrend: steps > prev.stepsToday ? 'up' : steps < prev.stepsToday ? 'down' : 'stable'
            };
        }

        await setDoc(healthMetricsRef, {
            heartRate: heart_rate || 72,
            bloodPressure: blood_pressure || 120,
            weight: weight || 70,
            stepsToday: steps || 0,
            ...trends,
            lastUpdated: serverTimestamp(),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: 'Health metrics updated successfully',
            trends
        }, { status: 200 });

    } catch (error) {
        console.error('Health metrics storage error:', error);
        return NextResponse.json({
            error: 'Failed to store health metrics',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({
                error: 'User ID is required'
            }, { status: 400 });
        }

        // Fetch health metrics from Firebase
        const healthMetricsRef = doc(db, 'users', userId, 'healthmetrics', 'latest');
        const healthMetricsSnap = await getDoc(healthMetricsRef);

        if (healthMetricsSnap.exists()) {
            const data = healthMetricsSnap.data();
            return NextResponse.json({
                metrics: {
                    heartRate: data.heartRate || 72,
                    bloodPressure: data.bloodPressure || 120,
                    weight: data.weight || 70,
                    stepsToday: data.stepsToday || 0,
                    heartRateTrend: data.heartRateTrend || 'stable',
                    bloodPressureTrend: data.bloodPressureTrend || 'stable',
                    weightTrend: data.weightTrend || 'stable',
                    stepsTrend: data.stepsTrend || 'stable',
                    lastUpdated: data.lastUpdated?.toDate?.() || new Date(data.updatedAt)
                }
            }, { status: 200 });
        } else {
            // Return default metrics if none exist
            return NextResponse.json({
                metrics: {
                    heartRate: 72,
                    bloodPressure: 120,
                    weight: 70,
                    stepsToday: 0,
                    heartRateTrend: 'stable',
                    bloodPressureTrend: 'stable',
                    weightTrend: 'stable',
                    stepsTrend: 'stable',
                    lastUpdated: new Date()
                }
            }, { status: 200 });
        }

    } catch (error) {
        console.error('Health metrics fetch error:', error);
        return NextResponse.json({
            error: 'Failed to fetch health metrics',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}