"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/layout/Header";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { message } from "antd";

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

  useEffect(() => {
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/sse`, {
      withCredentials: true,
    });

    console.log(sse);
    sse.onmessage = (event) => {
      console.log("Received SSE:", event.data);
    };

    sse.onerror = (err) => {
      console.error("SSE error:", err);
      sse.close();
      setTimeout(() => {
        setIsSidebarOpen((v) => v);
      }, 3000);
    };

    return () => {
      sse.close();
    };
  }, []);

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
