/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { message, Avatar, Dropdown, Button, Badge, List } from "antd";
import { UserOutlined, DownOutlined, BellOutlined } from "@ant-design/icons";

import {
  countUnreadNotificationsForGuest,
  getNotificationsForGuest,
} from "@/apis/notification";
import { useNotificationStore } from "@/stores/useNotificationStore";

export default function HeaderGuest() {
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    addNotification,
    setNotifications,
    setUnreadCount,
    removeNotification,
  } = useNotificationStore();

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

  const handleClickNotification = (item: any) => {
    try {
      const id = item.content_id;
      if (!id) return;

      if (item.type === "request") {
        router.push(`/guest/guest-requests?requestId=${item.content_id}`);
      } else if (item.type === "service") {
        router.push(`/guest/guest-services?serviceId=${id}`);
      } else {
        message.info("Loại thông báo không xác định");
        return;
      }

      removeNotification(item.id);
    } catch (err) {
      console.error(err);
      message.error("Không tìm thấy thông báo!");
    }
  };

  // ✔ Mở popup → load thông báo từ API
  const handleOpenChange = async (open: boolean) => {
    if (open) {
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
          className={`cursor-pointer px-4 py-3 rounded-md transition-all ${
            item.is_read === null
              ? "bg-gray-100 hover:bg-gray-200"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => handleClickNotification(item)}
        >
          <div className="flex flex-col text-gray-900 font-medium">
            <div>{item.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              Thời gian: {new Date(item.created_at).toLocaleString()}
            </div>
            {item.is_read && (
              <div className="text-xs text-green-600 mt-0.5">
                Đã đọc: {new Date(item.read_at).toLocaleString()}
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
