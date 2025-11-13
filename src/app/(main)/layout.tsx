"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/layout/Header";
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
        <Header />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
