"use client";

import type { User } from "firebase/auth";
import Image from "next/image";
import logo from "../assets/logo-recovai.jpeg"
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  BarChart,
  LogOut,
  Activity,
  FileScanIcon as FileAnalytics,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "context/AuthContext";

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
    { name: "Physical Therapy", href: "/therapy", icon: Activity, color: "text-green-500" },
    { name: "Report Analysis", href: "/reportAnalysis", icon: FileAnalytics, color: "text-purple-500" },
    { name: "Medicine Reminders", href: "/reminders", icon: Clock, color: "text-teal-500" },
    { name: "Users", href: "/User", icon: Users, color: "text-indigo-500" },
    // { name: "Reports", href: "/reports", icon: FileText, color: "text-blue-400" },
    // { name: "Analytics", href: "/analytics", icon: BarChart, color: "text-purple-400" },
    // { name: "Settings", href: "/settings", icon: Settings, color: "text-gray-500" },
  ];

  return (
    <aside className="flex h-full w-64 flex-col bg-gradient-to-b from-white to-gray-50 shadow-lg border-r border-gray-200">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r border-b border-blue-700 shadow-sm">
        <div className="flex justify-center items-center">
        <Image src={logo} alt="Recovai" width={40} height={40} />
        <h1 className="text-xl font-bold text-black tracking-tight">Recov.ai</h1>

        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-6 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? item.color : "text-gray-500"} transition-colors`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      {user ? (
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-blue-100">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-blue-50 text-blue-600 font-semibold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {user.displayName || user.email}
              </p>
              {user.displayName && user.email && (
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-4 w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      ) : (
        <div className="border-t border-gray-200 p-4 bg-white">
          <Link href="/login">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 rounded-lg shadow-md">
              Sign in
            </Button>
          </Link>
        </div>
      )}
    </aside>
  );
}