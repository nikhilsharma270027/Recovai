"use client";

import { useState, useRef } from "react";
import { useAuth } from "context/AuthContext";
import { Sidebar } from "@/components/SideBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Bell,
  CalendarIcon,
  Plus,
  Settings,
  Pill,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  nextDose: string;
  refillDate: string;
  adherence: number;
  imageUrl: string;
  contentType?: string; // Add contentType to store file MIME type
  taken: boolean;
}

export default function MedicineReminders() {
  const { user, loading } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([
    
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const markAsTaken = (id: string) => {
    setMedications(
      medications.map((med) => (med.id === id ? { ...med, taken: true } : med))
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(simulateProgress);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const { url, contentType } = await response.json();
      setUploadProgress(100);
      
      const newMedication: Medication = {
        id: `med${medications.length + 1}`,
        name: file.name.split(".")[0],
        dosage: "N/A",
        frequency: "N/A",
        timeOfDay: ["Morning"],
        nextDose: "Today, 8:00 AM",
        refillDate: new Date().toLocaleDateString(),
        adherence: 0,
        imageUrl: url,
        contentType: contentType,
        taken: false,
      };

      setMedications([...medications, newMedication]);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Helper function to check if contentType is an image
  const isImageContentType = (contentType?: string) => {
    return contentType?.startsWith("image/");
  };

  const todaysMedications = medications.filter((med) =>
    med.nextDose.includes("Today")
  );
  const upcomingMedications = medications.filter(
    (med) => !med.nextDose.includes("Today")
  );
  const takenToday = medications.filter(
    (med) => med.nextDose.includes("Today") && med.taken
  ).length;
  const totalToday = todaysMedications.length;
  const adherenceRate =
    medications.reduce((acc, med) => acc + med.adherence, 0) /
    medications.length;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Medicine Reminders
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Smart medication tracking and timely reminders
              </p>
            </div>
          </div>

          <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          <TabsTrigger
            value="today"
            className="text-gray-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg"
          >
            Today's Schedule
          </TabsTrigger>
          <TabsTrigger
            value="medications"
            className="text-gray-700 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-lg"
          >
            My Medications
          </TabsTrigger>
        </TabsList>

            <TabsContent value="today" className="space-y-6">
              <Card className="bg-blue-50 shadow-md rounded-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        Today's Medication Schedule
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Track your medication intake for today
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    >
                      <Bell className="mr-2 h-4 w-4 text-blue-500" />
                      Notification Settings
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Morning
                      </h3>
                      <div className="space-y-3">
                        {medications
                          .filter(
                            (med) =>
                              med.timeOfDay.includes("Morning") &&
                              med.nextDose.includes("Today")
                          )
                          .map((med) => (
                            <div
                              key={med.id}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  {isImageContentType(med.contentType) ? (
                                    <Image
                                      src={med.imageUrl || "/placeholder.svg"}
                                      alt={med.name}
                                      width={40}
                                      height={40}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <Pill className="h-6 w-6 text-blue-500" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {med.name} {med.dosage}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {med.frequency}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-600">
                                  8:00 AM
                                </div>
                                {med.taken ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">
                                    Taken
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="bg-blue-500 text-white hover:bg-blue-600"
                                    onClick={() => markAsTaken(med.id)}
                                  >
                                    Mark as Taken
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Evening
                      </h3>
                      <div className="space-y-3">
                        {medications
                          .filter(
                            (med) =>
                              med.timeOfDay.includes("Evening") &&
                              med.nextDose.includes("Today")
                          )
                          .map((med) => (
                            <div
                              key={med.id}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                  {isImageContentType(med.contentType) ? (
                                    <Image
                                      src={med.imageUrl || "/placeholder.svg"}
                                      alt={med.name}
                                      width={40}
                                      height={40}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <Pill className="h-6 w-6 text-purple-500" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {med.name} {med.dosage}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {med.frequency}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-600">
                                  8:00 PM
                                </div>
                                {med.taken ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">
                                    Taken
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="bg-blue-500 text-white hover:bg-blue-600"
                                    onClick={() => markAsTaken(med.id)}
                                  >
                                    Mark as Taken
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
{/* 
              <Card className="bg-indigo-50 shadow-md rounded-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r  rounded-t-xl">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Upcoming Medications
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Your medication schedule for the next few days
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {upcomingMedications.map((med) => (
                      <div
                        key={med.id}
                        className="flex items-center justify-between p-3 border-b border-gray-200 last:border-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Pill className="h-5 w-5 text-teal-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {med.name} {med.dosage}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {med.nextDose}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-600 hover:text-teal-700"
                        >
                          <Bell className="h-4 w-4" />
                          <span className="sr-only">Set reminder</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}
            </TabsContent>

            <TabsContent value="medications" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-purple-100 shadow-md rounded-xl border border-gray-100">
                  <CardHeader className="bg-gradient-to-r  rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                          My Medications
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Manage your medication list
                        </CardDescription>
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/*,.pdf"
                        />
                        <Button
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                          onClick={triggerFileInput}
                          disabled={uploading || !user}
                        >
                          {uploading ? (
                            `Uploading... (${Math.round(uploadProgress)}%)`
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Upload Medication
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {uploadError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        Error: {uploadError}
                      </div>
                    )}
                    {uploading && (
                      <Progress value={uploadProgress} className="mb-4" />
                    )}
                    <div className="space-y-4">
                      {medications.map((med) => (
                        <div
                          key={med.id}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                              {isImageContentType(med.contentType) ? (
                                <Image
                                  src={med.imageUrl || "/placeholder.svg"}
                                  alt={med.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <Pill className="h-6 w-6 text-purple-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {med.name}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>{med.dosage}</span>
                                <span>•</span>
                                <span>{med.frequency}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                              Refill: {med.refillDate}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}