"use client";

import { SidebarProvider } from "@/components/ui/sidebar"; // Ensure correct import path
import  { Sidebar } from "@/components/SideBar"; // Ensure correct import path
import { useAuth } from "context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login"); // Redirect to login if user is not authenticated
    return null;
  }

  return (
    <SidebarProvider >
      <div className="flex h-screen w-full">
        <Sidebar user={user} />
         {/* <main className="flex-1 overflow-auto p-6">{children}</main> */}
      </div> 
    </SidebarProvider>
  );
}
