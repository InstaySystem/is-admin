/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { message, Avatar, Dropdown, Button, Badge, List } from "antd";
import { UserOutlined, DownOutlined, BellOutlined } from "@ant-design/icons";

import {
  getNotificationsForAdmin,
  countUnreadNotifications,
  countUnreadNotificationsForGuest,
  getNotificationsForGuest,
} from "@/apis/notification";
import { getRequestById } from "@/apis/request";

export default function HeaderGuest() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await countUnreadNotificationsForGuest();
        setUnreadCount(res.data.data?.count || 0);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/sse`, {
      withCredentials: true,
    });

    sse.addEventListener("order_service", (event) => {
      const data = JSON.parse(event.data);
      message.info(`Đơn mới: ${data.content}`, 10);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    sse.addEventListener("request", (event) => {
      const data = JSON.parse(event.data);
      message.info(`Yêu cầu mới: ${data.content}`, 10);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    sse.onerror = (err) => {
      console.error("SSE error:", err);
      sse.close();
      setTimeout(() => {}, 3000);
    };

    return () => {
      sse.close();
    };
  }, []);

  const handleClickNotification = async (item: any) => {
    try {
      const id = item.content_id;
      if (!id) return;

      if (item.type === "request") {
        await getRequestById(id);
        router.push(`/manage-requests/${id}`);
      } else if (item.type === "service") {
        router.push(`/order-services/${id}`);
      } else {
        message.info("Loại thông báo không xác định");
        return;
      }

      // Xóa thông báo khỏi list và giảm count
      setNotifications((prev) => prev.filter((n) => n.id !== item.id));
      setUnreadCount((c) => Math.max(c - 1, 0));
    } catch (err) {
      console.error(err);
      message.error("Không tìm thấy thông báo!");
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      // Mở dropdown => lấy notifications
      try {
        const res = await getNotificationsForGuest();
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(0);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải thông báo!");
      }
    } else {
      try {
        const res = await countUnreadNotificationsForGuest();
        setUnreadCount(res.data.data?.count || 0);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Đây là Guest",
      icon: <UserOutlined />,
    },
    { type: "divider" as const },
  ];

  const notificationMenu = (
    <List
      className="w-80 max-h-96 overflow-auto bg-white rounded-md shadow-lg"
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item
          className={`cursor-pointer px-4! py-3 rounded-md transition-all ${
            item.staff_read === null
              ? "bg-gray-100 hover:bg-gray-200"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => handleClickNotification(item)}
        >
          <div className="flex flex-col text-gray-900 font-medium">
            <div>{item.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              <span>
                Thời gian: {new Date(item.created_at).toLocaleString()}
              </span>
            </div>
            {item.staff_read?.read_at && (
              <div className="text-xs text-green-600 mt-0.5">
                <span>
                  Đã đọc: {new Date(item.staff_read.read_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </List.Item>
      )}
    />
  );

  return (
    <header className="w-full bg-white shadow-md border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-linear-to-b from-blue-500 to-blue-600 rounded-full shadow" />
          <h1 className="text-2xl text-gray-900 font-semibold tracking-tight">
            GUEST PAGE
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <Dropdown
            overlay={notificationMenu}
            trigger={["click"]}
            placement="bottomRight"
            onOpenChange={handleOpenChange}
          >
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <BellOutlined className="text-2xl text-gray-600 cursor-pointer hover:text-blue-600 transition" />
            </Badge>
          </Dropdown>

          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              className="flex items-center gap-3 hover:bg-gray-100 px-2 py-1 rounded-lg transition"
            >
              <Avatar size={42} className="bg-blue-600 text-white shadow">
                GU
              </Avatar>
              <DownOutlined className="text-gray-600" />
            </Button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
