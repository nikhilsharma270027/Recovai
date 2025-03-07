"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

interface ReportExtractProps {
  file: File | null;
}

const ReportExtract: React.FC<ReportExtractProps> = ({ file }) => {
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Set the workerSrc to the static file in the public directory
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }
  }, []);

  useEffect(() => {
    if (file) {
      setIsProcessing(true);
      extractContent(file).finally(() => setIsProcessing(false));
    } else {
      setExtractedText("");
    }
  }, [file]);

  const formatText = (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const extractContent = async (file: File) => {
    try {
      let text = "";
      if (file.type.includes("image")) {
        text = await extractTextFromImage(file);
      } else if (file.type.includes("pdf")) {
        text = await extractTextFromPDF(file);
      } else if (file.type.includes("text")) {
        text = await extractTextFromTextFile(file);
      } else {
        text = "Unsupported file format. Please upload an image, PDF, or text file.";
      }
      setExtractedText(formatText(text));
    } catch (error: any) {
      setExtractedText(`Error processing file: ${error.message}`);
    }
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = async () => {
        const { data } = await Tesseract.recognize(reader.result as string, "eng", {
          logger: (m) => console.log(m),
        });
        resolve(data.text || "No text found in the image.");
      };
      reader.readAsDataURL(file);
    });
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text || "No text found in the PDF.";
  };

  const extractTextFromTextFile = async (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = () => {
        resolve((reader.result as string) || "No text found in the file.");
      };
      reader.readAsText(file);
    });
  };

  return (
    <Card className="bg-white shadow-md rounded-xl border border-gray-100 mt-6">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
        <CardTitle className="text-lg font-semibold text-gray-800">Extracted Report</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Textarea
          value={isProcessing ? "Processing file, please wait..." : extractedText}
          readOnly
          className="w-full h-40 p-4 border border-gray-200 rounded-md text-gray-800 font-mono text-sm bg-gray-50"
          placeholder="Extracted text will appear here..."
        />
      </CardContent>
    </Card>
  );
};

export default ReportExtract;