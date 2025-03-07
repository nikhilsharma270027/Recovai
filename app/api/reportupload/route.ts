import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const uid = formData.get("uid") as string;

    if (!file || !uid) {
      return NextResponse.json({ error: "Missing file or uid" }, { status: 400 });
    }

    const filePath = `reportanalysis/${uid}/${file.name}`;
    const storageRef = ref(storage, filePath);
    
    // ✅ Convert to Uint8Array instead of Buffer (simpler)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // ✅ Upload file to Firebase Storage
    await uploadBytes(storageRef, uint8Array, { contentType: file.type });

    // ✅ Get file download URL
    const downloadURL = await getDownloadURL(storageRef);

    return NextResponse.json(
      { url: downloadURL, contentType: file.type, file: file.name },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
