// src/app/dashboard/layout.tsx
import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

export const metadata: Metadata = {
  title: "Dashboard | Chat Agent",
  description: "User dashboard with sidebar and navbar",
};

// This layout wraps all dashboard pages
export default function DashboardLayout() {
  return (
    <div className="flex">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 ml-64">
        <Navbar />
      </div>
    </div>
  );
}
