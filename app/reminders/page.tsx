"use client";

import { useState, useRef, useEffect } from "react";
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
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface Medication {
  dosage: string;
  duration: string;
  frequency: string;
  instructions: string;
  name: string;
  time_of_day: string; // Corrected typo here
  taken?: boolean;
}

interface PrescriptionData {
  medications: Medication[];
  recommendations: string[];
  text: string;
  uploadDate: string;
}

export default function MedicineReminders() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null); // Store
  const [prescriptionData, setPrescriptionData] = useState<Medication[]>([]); // Changed type to Medication[]
  const [medications, setMedications] = useState<Medication[]>([]);

  const { user, loading } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);



  useEffect(() => {
    const fetchMedications = async () => {
      if (!user) {
        console.error("User not authenticated. Cannot fetch medications.");
        return;
      }

      try {
        const userPrescriptionsRef = doc(
          db,
          "users",
          user.uid,
          "medicinereminders",
          "medications"
        );
        const docSnap = await getDoc(userPrescriptionsRef);

        if (docSnap.exists()) {
          // Correctly access the medications array from the document data
          const data = docSnap.data();
          if (data && data.medications && Array.isArray(data.medications)) {
            setPrescriptionData(data.medications as Medication[]); // Cast to Medication[]
          } else {
            setPrescriptionData([]);
          }
        } else {
          setPrescriptionData([]);
        }
      } catch (error) {
        console.error("Error fetching medications from Firebase:", error);
      }
    };

    fetchMedications();
  }, [user]);

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
      setUploadedFileName(file.name);

      const responseData = await response.json();

      let response2;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        console.log(`Attempt ${attempts + 1} to fetch analysis data...`);
        try {
          response2 = await fetch("/api/medicinereminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          name: responseData.file,
        }),
          });

          if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response2.status}`);
          }

          break; // Exit loop if request is successful
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts: ${error.message}`);
          }
          console.error(`Attempt ${attempts} failed. Retrying in 2 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
      const datatoupload = await response2.json();

      console.log(datatoupload);
      if (!datatoupload || !datatoupload.structuredData) {
        throw new Error("No valid data received from server");
      }

      try {
        const userPrescriptionsRef = doc(
          db,
          "users",
          user.uid,
          "medicinereminders",
          "medications"
        );
        const newMedications = datatoupload.structuredData.medications;

        await setDoc(
          userPrescriptionsRef,
          {
            medications: arrayUnion(...newMedications),
            uploadDate: serverTimestamp(),
          },
          { merge: true }
        );

        console.log("Medications updated successfully");
      } catch (error) {
        console.error("Error storing prescription in Firebase:", error);
        throw error;
      }

      clearInterval(simulateProgress);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isImageContentType = (contentType?: string) => {
    return contentType?.startsWith("image/");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const markAsTaken = async (medicationName: string) => {
    if (!user) return;

    try {
      const userPrescriptionsRef = doc(db, "users", user.uid, "medicinereminders", "medications");
      const docSnap = await getDoc(userPrescriptionsRef);

      if (docSnap.exists()) {
        let medications = docSnap.data().medications;
        medications = medications.map((med: Medication) =>
          med.name === medicationName ? { ...med, taken: true } : med
        );

        await updateDoc(userPrescriptionsRef, { medications });
        setPrescriptionData(medications);
      }
    } catch (error) {
      console.error("Error updating medication status:", error);
    }
  };

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
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white rounded-xl p-0 shadow-sm border border-gray-200">
              <TabsTrigger
                value="today"
                className="text-gray-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg p-1.5"
              >
                Today's Schedule
              </TabsTrigger>
              <TabsTrigger
                value="medications"
                className="text-gray-700 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-lg p-1.5"
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
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Morning
                      </h3>
                      <div className="space-y-3">
                        {prescriptionData
                          .filter((med) => med.time_of_day === "Morning")
                          .map((med, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Pill className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {med.name} {med.dosage}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {med.frequency} - {med.instructions}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                              <Button
                        size="sm"
                        className={med.taken ? "bg-gray-400 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}
                        onClick={() => markAsTaken(med.name)}
                        disabled={med.taken}
                      >
                        {med.taken ? "Taken" : "Mark as Taken"}
                      </Button>
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
                        {prescriptionData
                          .filter((med) => med.time_of_day === "Evening")
                          .map((med, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Pill className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {med.name} {med.dosage}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {med.frequency} - {med.instructions}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                              <Button
                        size="sm"
                        className={med.taken ? "bg-gray-400 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}
                        onClick={() => markAsTaken(med.name)}
                        disabled={med.taken}
                      >
                        {med.taken ? "Taken" : "Mark as Taken"}
                      </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                      {prescriptionData.map((med) => (
                        <div
                          key={med.name} // Use a unique identifier, assuming name is unique
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                              {isImageContentType(med.name) ? ( //This part is incorrect.  med.name is not content type.  Content type is not available on this object.
                                <Image
                                  src={"/placeholder.svg"} // No image URL available. Using default placeholder
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
                              {/* Refill: {med.refillDate} Refill date not available.*/}
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