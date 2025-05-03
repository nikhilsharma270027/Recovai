"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "context/AuthContext";
import { addDoc, arrayUnion, collection, doc, Firestore, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

interface UploadFilesProps {
  onFileSelect: (file: File | null) => void;
}

export default function UploadFiles({ onFileSelect }: UploadFilesProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null); // Store

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    setUploadProgress(0);

    if (!file) {
      setUploadError("No file selected");
      return;
    }

    if (!user) {
      setUploadError("User not authenticated. Please sign in.");
      return;
    }

    setUploading(true);
    console.log("Starting upload for file:", file.name);
    onFileSelect(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uid", user.uid);

      const simulateProgress = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/reportupload", {
        method: "POST",
        body: formData,
      });
      setUploadedFileName(file.name);

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${errorText}`);
      }

      const responseData = await response.json();

      let response2;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        console.log(`Attempt ${attempts + 1} to fetch analysis data...`);
        try {
          response2 = await fetch("/api/reportanalysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          name: responseData.file,
        }),
          });

          if (response2.ok) {
        break; // Exit loop if request is successful
          } else {
        throw new Error(`HTTP error! status: ${response2.status}`);
          }
        } catch (error: any) {
          attempts++;
          if (attempts >= maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts: ${error.message}`);
          }
          console.error(`Attempt ${attempts} failed: ${error.message}. Retrying in 2 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
        }
      }
      if (!response2) {
        console.error("response2 is undefined");
        return;
      }
      
      const datatoupload = await response2.json();

      console.log("uploadfile anaylsis", datatoupload);
      if (!datatoupload || !datatoupload.structuredData) {
        throw new Error("No valid data received from server");
      }

      const { file_name, analyzed_on, insights } = datatoupload.structuredData;

      // Create a unique document for each report
      try {
        const userReportRef = collection(db, "users", user.uid, "reportinsights");
      
        await addDoc(userReportRef, {
          file_name,
          analyzed_on,
          insights, // Store full insight objects
          uploadDate: serverTimestamp(),
        });
      
        console.log("Report insights stored successfully");
      } catch (error) {
        console.error("Error storing report insights in Firebase:", error);
        throw error;
      }


      
      clearInterval(simulateProgress);
      setUploadProgress(100);
      alert("Successfully uploaded medication!");

    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadError(error.message || "Failed to upload file");
      alert(`Upload failed: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const fileArray = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        file,
      }));
      setFiles(fileArray);
      if (fileArray.length > 0) {
        onFileSelect(fileArray[0].file); // Send the first file for processing
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    multiple: false, // Limit to one file for simplicity
  });

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
    if (files.length === 1) {
      onFileSelect(null); // Clear extracted text if no files remain
    }
  };

  return (
    <Card className="bg-indigo-50 shadow-md rounded-xl border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Upload Files
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload} // ✅ Ensures input works
            className="hidden"
            accept="image/*,.pdf"
          />
          <Upload className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-800">
            {isDragActive ? "Drop your file here" : "Drag and drop your files here"}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            or click to browse (PDF, Image, or Text files)
          </p>

          {/* ✅ Fix: Trigger file input on button click */}
          <Button
            className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Files</h3>
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

