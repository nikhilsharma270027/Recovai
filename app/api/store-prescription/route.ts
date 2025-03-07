// app/api/store-prescription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "app/lib/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const { text, structuredData } = await request.json();
    const { medications, recommendations } = structuredData;

    // Assuming you have the user ID from authentication context or request
    const userId = request.headers.get("x-user-id") || "default-user"; // Replace with actual user ID logic

    // Store the prescription data in Firestore under the user's ID
    const prescriptionRef = doc(db, "users", userId, "prescriptions", Date.now().toString());
    await setDoc(prescriptionRef, {
      text,
      medications,
      recommendations,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Prescription stored successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error storing prescription:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}