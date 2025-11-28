"use client";

import { useEffect } from "react";
import { message } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { FileTextOutlined, AppstoreOutlined } from "@ant-design/icons";
import HeaderGuest from "@/components/layout/HeaderGuest";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/sse`, {
      withCredentials: true,
    });

    sse.addEventListener("order_service", (event) => {
      const data = JSON.parse(event.data);
      messageApi.info(`Có thông báo mới: ${data.content}`, 10);
    });

    sse.addEventListener("request", (event) => {
      const data = JSON.parse(event.data);
      messageApi.info(`Yêu cầu mới: ${data.content}`, 10);
    });

    sse.onerror = (err) => {
      console.error("SSE error:", err);
      sse.close();
    };

    return () => sse.close();
  }, [messageApi]);

  const navItems = [
    {
      key: "/guest",
      label: "Home",
      icon: <AppstoreOutlined className="text-xl" />,
    },
    {
      key: "/guest/guest-requests",
      label: "Requests",
      icon: <FileTextOutlined className="text-xl" />,
    },
    {
      key: "/guest/guest-services",
      label: "Services",
      icon: <AppstoreOutlined className="text-xl" />,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {contextHolder}
      <HeaderGuest />

      <main className="flex-1 overflow-auto p-4 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t flex justify-around py-2 z-50">
        {navItems.map((item) => {
          const active = pathname === item.key;
          return (
            <button
              key={item.key}
              className={`flex flex-col items-center text-xs ${
                active ? "text-blue-600" : "text-gray-500"
              }`}
              onClick={() => router.push(item.key)}
            >
              <div className={`${active ? "text-blue-600" : "text-gray-500"}`}>
                {item.icon}
              </div>
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
