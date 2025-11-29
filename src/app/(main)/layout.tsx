"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/layout/Header";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { message } from "antd";
import { useNotificationStore } from "@/stores/useNotificationStore";

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
  const [messageApi, contextHolder] = message.useMessage();

  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/sse`, {
      withCredentials: true,
    });

    sse.addEventListener("order_service", (event) => {
      const data = JSON.parse(event.data);
      messageApi.info(`Đơn mới: ${data.content}`, 10);
      addNotification(data);
    });

    sse.addEventListener("request", (event) => {
      const data = JSON.parse(event.data);
      messageApi.info(`Yêu cầu mới: ${data.content}`, 10);
      addNotification(data);
    });

    sse.onerror = (err) => {
      console.error("SSE error:", err);
      sse.close();
    };

    return () => sse.close();
  }, [messageApi, addNotification]);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased flex h-screen`}
    >
      {contextHolder}
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
