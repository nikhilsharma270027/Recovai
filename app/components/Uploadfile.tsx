"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

interface UploadFilesProps {
  onFileSelect: (file: File) => void;
}

export default function UploadFiles({ onFileSelect }: UploadFilesProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

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
      onFileSelect(null as any); // Clear extracted text if no files remain
    }
  };

  return (
    <Card className="bg-indigo-50 shadow-md rounded-xl border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <CardTitle className="text-lg font-semibold text-gray-800">Upload Files</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-800">
            {isDragActive ? "Drop your file here" : "Drag and drop your files here"}
          </h3>
          <p className="mt-1 text-sm text-gray-600">or click to browse (PDF, Image, or Text files)</p>
          <Button className="mt-4 bg-blue-500 text-white hover:bg-blue-600">Select Files</Button>
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