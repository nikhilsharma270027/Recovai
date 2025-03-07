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

    const filePath = `medicinereminders/${uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadBytes(storageRef, buffer, { contentType: file.type });
    const downloadURL = await getDownloadURL(storageRef);

    return NextResponse.json({ url: downloadURL, contentType: file.type }, { status: 200 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}