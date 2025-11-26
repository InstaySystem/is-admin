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
  const [messageApi, contextHolder] = message.useMessage(); // <-- thêm message API
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/sse`, {
      withCredentials: true,
    });

    sse.onmessage = (event) => {
      console.log("Default message:", event.data);
    };

    sse.addEventListener("order_service", (event) => {
      console.log("Order Service event:", event.data);
      const data = JSON.parse(event.data);
      setNotifications((prev) => [data, ...prev]);
      messageApi.info(`Đơn mới: ${data.content}`, 10);
    });

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
  }, [messageApi]);

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
        <Header
          notifications={notifications}
          setNotifications={setNotifications}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
