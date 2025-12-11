"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/layout/Header";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useAppStore } from "@/stores/useAppStore";
import { useMessage } from "../providers/MessageProvider";

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

  const addNotification = useNotificationStore((s) => s.addNotification);
  const role = useAppStore((s) => s._role);
  const msg = useMessage();

  useEffect(() => {
    if (role === "admin") {
      return;
    }

    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/sse`, {
      withCredentials: true,
    });

    sse.addEventListener("order_service", (event) => {
      const data = JSON.parse(event.data);
      msg.info(`Đơn mới: ${data.content}`);
      addNotification(data);
    });

    sse.addEventListener("request", (event) => {
      const data = JSON.parse(event.data);
      msg.info(`Yêu cầu mới: ${data.content}`);
      addNotification(data);
    });

    sse.onerror = (err) => {
      console.error("SSE error:", err);
      sse.close();
    };

    return () => sse.close();
  }, [msg, addNotification]);

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
