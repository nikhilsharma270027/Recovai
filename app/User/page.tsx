"use client";

import { useAuth } from "context/AuthContext"; // Assuming this provides Firebase auth data
import { Sidebar } from "@/components/SideBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  Mail,
  Calendar,
  FileText,
  LogOut,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface UserProfileProps {
  uploadedReports?: number; // Optional prop for report count; fetch from backend if needed
}

export default function UserProfile() {
  const [uploadedReports, setUploadedReports] = useState<number>(0);
  const { user, loading, logout } = useAuth(); // Assuming useAuth provides user and logout
  const [reportCount, setReportCount] = useState(uploadedReports); // State for report count


  useEffect(() => {
    if (!uploadedReports) {

      setReportCount(uploadedReports);
    }
  }, [uploadedReports]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-gray-600 text-lg">Please sign in to view your profile.</p>
      </div>
    );
  }

  const joinDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="flex h-screen w-full">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
              <p className="mt-2 text-sm text-gray-600">Your account details and activity</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                <Settings className="mr-2 h-4 w-4 text-blue-500" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-2"
            >
              <Card className="bg-white shadow-md rounded-xl border border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                  <CardTitle className="text-lg font-semibold text-gray-800">Profile Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
                    <Avatar className="h-24 w-24 border-2 border-blue-200">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {user.displayName || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="text-lg font-semibold text-gray-800">{user.email || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Joined</p>
                          <p className="text-lg font-semibold text-gray-800">{joinDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reports Uploaded Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-white shadow-md rounded-xl border border-purple-100">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                  <CardTitle className="text-lg font-semibold text-gray-800">Activity Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Reports Uploaded</p>
                        <p className="text-2xl font-bold text-gray-800">{reportCount}</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {reportCount === 0 ? "No reports yet" : `${reportCount} report${reportCount === 1 ? "" : "s"}`}
                    </Badge>
                    <Button
                      variant="outline"
                      className="w-full bg-white text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="md:col-span-3"
            >
              <Card className="bg-white shadow-md rounded-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl">
                  <CardTitle className="text-lg font-semibold text-gray-800">Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Update Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}