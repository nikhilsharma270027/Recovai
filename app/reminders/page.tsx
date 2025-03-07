"use client";

import { useState } from "react";
import { useAuth } from "context/AuthContext";
import { Sidebar } from "@/components/SideBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  taken: boolean;
}

export default function MedicineReminders() {
  const { user, loading } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "med1",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      timeOfDay: ["Morning"],
      nextDose: "Today, 8:00 AM",
      refillDate: "June 15, 2024",
      adherence: 95,
      imageUrl: "/placeholder.svg?height=100&width=100",
      taken: true,
    },
    {
      id: "med2",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      timeOfDay: ["Morning", "Evening"],
      nextDose: "Today, 8:00 PM",
      refillDate: "May 30, 2024",
      adherence: 88,
      imageUrl: "/placeholder.svg?height=100&width=100",
      taken: false,
    },
    {
      id: "med3",
      name: "Vitamin D",
      dosage: "2000 IU",
      frequency: "Once daily",
      timeOfDay: ["Morning"],
      nextDose: "Tomorrow, 8:00 AM",
      refillDate: "July 10, 2024",
      adherence: 75,
      imageUrl: "/placeholder.svg?height=100&width=100",
      taken: true,
    },
    {
      id: "med4",
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      timeOfDay: ["Evening"],
      nextDose: "Today, 8:00 PM",
      refillDate: "June 5, 2024",
      adherence: 92,
      imageUrl: "/placeholder.svg?height=100&width=100",
      taken: false,
    },
  ]);

  const markAsTaken = (id: string) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, taken: true } : med)));
  };

  const todaysMedications = medications.filter((med) => med.nextDose.includes("Today"));
  const upcomingMedications = medications.filter((med) => !med.nextDose.includes("Today"));
  const takenToday = medications.filter((med) => med.nextDose.includes("Today") && med.taken).length;
  const totalToday = todaysMedications.length;
  const adherenceRate = medications.reduce((acc, med) => acc + med.adherence, 0) / medications.length;

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
              <h1 className="text-3xl font-bold text-gray-800">Medicine Reminders</h1>
              <p className="mt-2 text-sm text-gray-600">Smart medication tracking and timely reminders</p>
            </div>
            {/* <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                <Settings className="mr-2 h-4 w-4 text-blue-500" />
                Settings
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </div> */}
          </div>

         

          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
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
              <TabsTrigger
                value="insights"
                className="text-gray-700 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 rounded-lg"
              >
                Adherence Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              <Card className="bg-white shadow-md rounded-xl border border-gray-100">
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
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Morning</h3>
                      <div className="space-y-3">
                        {medications
                          .filter((med) => med.timeOfDay.includes("Morning") && med.nextDose.includes("Today"))
                          .map((med) => (
                            <div
                              key={med.id}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Image
                                    src={med.imageUrl || "/placeholder.svg"}
                                    alt={med.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {med.name} {med.dosage}
                                  </h4>
                                  <p className="text-sm text-gray-500">{med.frequency}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-600">8:00 AM</div>
                                {med.taken ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">Taken</Badge>
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
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Evening</h3>
                      <div className="space-y-3">
                        {medications
                          .filter((med) => med.timeOfDay.includes("Evening") && med.nextDose.includes("Today"))
                          .map((med) => (
                            <div
                              key={med.id}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Image
                                    src={med.imageUrl || "/placeholder.svg"}
                                    alt={med.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {med.name} {med.dosage}
                                  </h4>
                                  <p className="text-sm text-gray-500">{med.frequency}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-600">8:00 PM</div>
                                {med.taken ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">Taken</Badge>
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

              <Card className="bg-white shadow-md rounded-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 rounded-t-xl">
                  <CardTitle className="text-lg font-semibold text-gray-800">Upcoming Medications</CardTitle>
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
                            <p className="text-sm text-gray-500">{med.nextDose}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                          <Bell className="h-4 w-4" />
                          <span className="sr-only">Set reminder</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-white shadow-md rounded-xl border border-gray-100">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-800">My Medications</CardTitle>
                        <CardDescription className="text-gray-600">Manage your medication list</CardDescription>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Medication
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {medications.map((med) => (
                        <div
                          key={med.id}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                              <Image
                                src={med.imageUrl || "/placeholder.svg"}
                                alt={med.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{med.name}</h4>
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
                            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-white shadow-md rounded-xl border border-gray-100">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-xl">
                      <CardTitle className="text-lg font-semibold text-gray-800">Medication Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 text-yellow-800 rounded-md shadow-sm">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Low Supply Alert</p>
                            <p className="text-xs mt-1">Metformin (500mg) - 10 days remaining</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 text-blue-800 rounded-md shadow-sm">
                          <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Upcoming Refill</p>
                            <p className="text-xs mt-1">Lisinopril (10mg) - Refill on June 15</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                        size="sm"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Manage Alerts
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-md rounded-xl border border-gray-100">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 rounded-t-xl">
                      <CardTitle className="text-lg font-semibold text-gray-800">Notification Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="h-5 w-5 text-teal-500" />
                            <span className="text-sm text-gray-700">Mobile Notifications</span>
                          </div>
                          <div className="h-5 w-10 bg-teal-500 rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bell className="h-5 w-5 text-teal-500" />
                            <span className="text-sm text-gray-700">Reminder Alerts</span>
                          </div>
                          <div className="h-5 w-10 bg-teal-500 rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="h-5 w-5 text-teal-500" />
                            <span className="text-sm text-gray-700">Refill Reminders</span>
                          </div>
                          <div className="h-5 w-10 bg-teal-500 rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"></div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4 bg-white text-teal-600 border-teal-200 hover:bg-teal-50"
                        size="sm"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Advanced Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-white shadow-md rounded-xl border border-gray-100">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl">
                    <CardTitle className="text-lg font-semibold text-gray-800">Adherence Insights</CardTitle>
                    <CardDescription className="text-gray-600">
                      Track your medication adherence over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-80 w-full bg-gray-50 rounded-md flex items-center justify-center shadow-inner">
                      <div className="text-center">
                        <BarChart3 className="h-10 w-10 mx-auto text-green-500" />
                        <p className="mt-2 text-sm text-gray-500">Adherence chart visualization</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="p-4 bg-green-50 rounded-md text-center shadow-sm">
                        <p className="text-sm text-gray-600">This Week</p>
                        <p className="text-2xl font-bold mt-1 text-green-700">92%</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-md text-center shadow-sm">
                        <p className="text-sm text-gray-600">This Month</p>
                        <p className="text-2xl font-bold mt-1 text-green-700">87%</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-md text-center shadow-sm">
                        <p className="text-sm text-gray-600">Missed Doses</p>
                        <p className="text-2xl font-bold mt-1 text-red-700">3</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-md text-center shadow-sm">
                        <p className="text-sm text-gray-600">On-Time Rate</p>
                        <p className="text-2xl font-bold mt-1 text-blue-700">85%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-white shadow-md rounded-xl border border-gray-100">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                      <CardTitle className="text-lg font-semibold text-gray-800">Medication Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {medications.map((med) => (
                          <div key={med.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{med.name}</span>
                              <span className="text-sm text-gray-600">{med.adherence}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  med.adherence > 90
                                    ? "bg-green-400"
                                    : med.adherence > 75
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                }`}
                                style={{ width: `${med.adherence}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-md rounded-xl border border-gray-100">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl">
                      <CardTitle className="text-lg font-semibold text-gray-800">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center">
                            <span className="text-blue-700 text-xs">1</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Set consistent medication times</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Taking medications at the same time each day improves adherence
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center">
                            <span className="text-blue-700 text-xs">2</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Use pill organizers</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Weekly pill organizers can help track medication intake
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center">
                            <span className="text-blue-700 text-xs">3</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Set up auto-refills</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Automatic refills ensure you never run out of medication
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}