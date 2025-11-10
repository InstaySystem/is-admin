"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased flex h-screen`}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col bg-gray-50 overflow-auto">
        <header className="w-full h-16 bg-white shadow-md flex items-center px-6">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
