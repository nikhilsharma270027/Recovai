"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  BarChart3,
  LineChart,
  ArrowUpRight,
  Download,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "context/AuthContext";
import { Sidebar } from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import ReportExtract from "@/components/FileExtract";
import UploadFiles from "@/components/Uploadfile";
import { getDownloadURL, getMetadata, listAll, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  error?: string;
  insights?: string[];
  date?: string;
};

export default function ReportAnalysis() {
  const [extractedText, setExtractedText] = useState("");



  function extractReport() {
    // Simulating an AI extraction process
    setExtractedText(
      "Patient Name: John Doe\nDiagnosis: Mild Fever\nPrescription: Paracetamol"
    );
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user, loading } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [insights, setInsights] = useState([]);



  useEffect(() => {
    const fetchFiles = async () => {
      if (!user?.uid) return;

      try {
        const storageRef = ref(storage, `/reportanalysis/${user.uid}`);
        const fileList = await listAll(storageRef);

        const fileMetadataPromises = fileList.items.map(async (fileRef) => {
          const metadata = await getMetadata(fileRef);
          const downloadURL = await getDownloadURL(fileRef);
          return { ...metadata, downloadURL };

        });

        const filesWithMetadata = await Promise.all(fileMetadataPromises);
        setFiles(filesWithMetadata as any);
      } catch (error) {
        console.error("Error fetching files from Firebase Storage:", error);
      }
    };

    fetchFiles();
  }, [user?.uid]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!user?.uid) return;

      try {
        // Reference to the user's reportinsights collection
        const userReportsRef = collection(db, "users", user.uid, "reportinsights");

        // Query to fetch all documents ordered by uploadDate (latest first)
        const querySnapshot = await getDocs(query(userReportsRef, orderBy("uploadDate", "desc")));

        // Extract and store insights
        const insightsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          status: "complete",
        }));

        console.log("Fetched insights:", insightsData);
        setInsights(insightsData as any); // Store in state
      } catch (error) {
        console.error("Error fetching report insights from Firebase:", error);
      }
    };

    fetchInsights();
  }, [user?.uid]);



  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress for each file
      newFiles.forEach((file) => {
        simulateFileUpload(file.id);
      });
    }
  };

  const simulateFileUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Generate random insights after upload completes
        const insights = [
          "Detected elevated glucose levels",
          "Blood pressure readings are normal",
          "Cholesterol levels slightly above normal range",
          "Vitamin D deficiency detected",
          "Iron levels within normal range",
          "Thyroid function tests normal",
        ];

        const randomInsights = Array(3)
          .fill(0)
          .map(() => insights[Math.floor(Math.random() * insights.length)]);

        setFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? {
                ...file,
                progress,
                status: "complete",
                date: new Date().toISOString().split("T")[0],
                insights: randomInsights,
              }
              : file
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === fileId ? { ...file, progress } : file
          )
        );
      }
    }, 300);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress for each file
      newFiles.forEach((file) => {
        simulateFileUpload(file.id);
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const completedFiles = files.filter(
    (file) => file.status === "complete"
  ).length;
  const totalInsights = files.reduce(
    (acc, file) => acc + (file.insights?.length || 0),
    0
  );



  return (
    <div className="flex h-screen w-full">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Report Analysis
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                AI-powered medical report analysis and insights
              </p>
            </div>

          </div>

          <Tabs
            defaultValue="upload"
            className="w-full"
            onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white rounded-xl p-0 shadow-sm border border-gray-200">
              <TabsTrigger
                value="upload"
                className="text-gray-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg p-1.5">
                Upload Reports
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="text-gray-700 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-lg p-1.5">
                AI Insights
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-gray-700 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 rounded-lg p-1.5">
                Report History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="space-y-6 ">
                <UploadFiles onFileSelect={setSelectedFile} />
                {/* {selectedFile && <ReportExtract file={selectedFile} />} */}
              </div>
            </TabsContent>
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Insights Overview */}
              <Card className="md:col-span-2 bg-purple-50 shadow-md rounded-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r rounded-t-xl">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Health Insights Overview
                </CardTitle>
                <CardDescription className="text-gray-600">
                  AI-generated insights from your medical reports
                </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                <div className="space-y-6">
                  {insights.map((insight) => (
                    <div
                    key={insight.id}
                    className="border-b border-gray-200 pb-4 last:border-0"
                    >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                      <h4 className="font-semibold text-gray-800">{insight.file_name}</h4>
                      <p className="text-sm text-gray-500">
                        Analyzed on {insight.analyzed_on}
                      </p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                      Analyzed
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-3">
                      {insight.insights.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-md shadow-sm"
                      >
                        <div className="flex items-start">
                        <div className="mr-3 mt-1 h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center">
                          <span className="text-blue-700 text-xs">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">{item.insight}</p>
                          <p className="text-xs text-gray-500 mt-1">
                          Confidence: {item.confidence}
                          </p>
                        </div>
                        </div>
                      </div>
                      ))}
                    </div>
                    {/* <div className="mt-3 flex justify-end">
                      <Button
                      variant="outline"
                      size="sm"
                      className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                      </Button>
                    </div> */}
                    </div>
                  ))}
                </div>
                </CardContent>
              </Card>

              {/* Additional Info (Health Categories & Actions) */}
              <div className="space-y-6">
                <Card className="bg-green-50 shadow-md rounded-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r  rounded-t-xl">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                  Health Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                  {[
                    { name: "Cardiovascular", value: 92 },
                    { name: "Metabolic", value: 78 },
                    { name: "Nutritional", value: 65 },
                    { name: "Immune System", value: 88 },
                  ].map((category, index) => (
                    <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                      {category.name}
                      </span>
                      <span className="text-sm text-gray-600">{category.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                      className="h-full bg-green-400 rounded-full"
                      style={{ width: `${category.value}%` }}
                      ></div>
                    </div>
                    </div>
                  ))}
                  </div>
                </CardContent>
                </Card>

                {/* Recommended Actions */}
                <Card className="bg-indigo-50 shadow-md rounded-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r rounded-t-xl">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                  Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                  {[
                    "Schedule follow-up for vitamin D levels",
                    "Increase iron-rich foods in diet",
                    "MRI follow-up for right knee",
                  ].map((action, index) => (
                    <li key={index} className="flex items-start">
                    <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-blue-700 text-xs">{index + 1}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{action}</p>
                    </li>
                  ))}
                  </ul>
                </CardContent>
                </Card>
              </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="bg-teal-50 shadow-md rounded-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        Report History
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        View and manage your uploaded medical reports
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100">
                        <Filter className="mr-2 h-4 w-4 text-blue-500" />
                        Filter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100">
                        <Search className="mr-2 h-4 w-4 text-purple-500" />
                        Search
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-5 p-4 font-semibold text-gray-700 bg-gray-50">
                      <div className="col-span-2">Report Name</div>
                      <div>Date</div>
                      <div>Type</div>
                      <div>Status</div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {files.map((file) => (
                        <div
                          key={file.fullPath}
                          className="grid grid-cols-5 p-4 items-center hover:bg-gray-50">
                          <div className="col-span-2 flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-400" />
                            <span className="font-medium text-gray-800">
                              {file.name}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            {new Date(file.timeCreated).toLocaleDateString()}
                          </div>
                          <div className="text-gray-600">
                            {file.contentType.split("/")[1].toUpperCase()}
                          </div>
                          <div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Analyzed
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
