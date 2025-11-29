"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Dropdown,
  Button,
  Badge,
  List,
  message as antdMessage,
} from "antd";
import { LogoutOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import { IoNotificationsOutline, IoChatbubbleOutline } from "react-icons/io5";

import { logOut } from "@/apis/auth";
import { useAppStore } from "@/stores/useAppStore";
import { removeCookie } from "@/utils/cookies";
import {
  getNotificationsForAdmin,
  countUnreadNotifications,
} from "@/apis/notification";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useMessageStore } from "@/stores/useMessageStore";

export default function Header() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);

  // Notification store
  const {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
    removeNotification,
  } = useNotificationStore();

  // Message store
  const { messages } = useMessageStore();
  const unreadMessagesCount = messages.length; // badge số tin nhắn chưa đọc

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await countUnreadNotifications();
        setUnreadCount(res.data.data?.count || 0);
      } catch (err) {
        console.error("Fetch unread failed", err);
      }
    };
    fetchUnread();
  }, [setUnreadCount]);

  const handleLogout = async () => {
    try {
      const res = await logOut();
      useAppStore.getState().clearUser();
      removeCookie("role");
      antdMessage.success(res.data.message || "Đăng xuất thành công");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleClickNotification = (item: any) => {
    try {
      if (item.type === "request") {
        router.push(`/manage-requests/${item.content_id}`);
      } else if (item.type === "service") {
        router.push(`/order-services/${item.content_id}`);
      }
      removeNotification(item.id);
    } catch (err) {
      console.error(err);
      antdMessage.error("Không tìm thấy thông báo!");
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      try {
        const res = await getNotificationsForAdmin();
        setNotifications(res.data.data.notifications || []);
      } catch (err) {
        console.error(err);
        antdMessage.error("Không thể tải thông báo!");
      }
    } else {
      try {
        const res = await countUnreadNotifications();
        setUnreadCount(res.data.data?.count || 0);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Notification dropdown
  const notificationMenu = (
    <List
      className="w-80 max-h-96 overflow-auto bg-white rounded-md shadow-lg"
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item
          className={`cursor-pointer px-4 py-3 rounded-md transition-all ${
            item.staff_read === null
              ? "bg-gray-100 hover:bg-gray-200"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => handleClickNotification(item)}
        >
          <div className="flex flex-col">
            <div>{item.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        </List.Item>
      )}
    />
  );

  const messageMenu = (
    <List
      className="w-80 max-h-96 overflow-auto bg-white rounded-md shadow-lg"
      dataSource={messages}
      renderItem={(item: any) => (
        <List.Item className="cursor-pointer px-4 py-3 rounded-md transition-all">
          <div className="flex flex-col">
            <div>{item.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        </List.Item>
      )}
    />
  );

  const userMenuItems = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <UserOutlined />,
      onClick: () => router.push("/profile"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="w-full bg-white shadow-md border-b sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Trang quản lý</h1>

        <div className="flex items-center gap-5">
          {/* Chat icon với badge */}
          <Dropdown
            overlay={messageMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Badge count={unreadMessagesCount} size="small">
              <IoChatbubbleOutline className="text-2xl text-black cursor-pointer hover:text-blue-600" />
            </Badge>
          </Dropdown>

          {/* Notification icon với badge */}
          <Dropdown
            overlay={notificationMenu}
            trigger={["click"]}
            placement="bottomRight"
            onOpenChange={handleOpenChange}
          >
            <Badge count={unreadCount} size="small">
              <IoNotificationsOutline className="text-2xl cursor-pointer text-gray-600 hover:text-blue-600" />
            </Badge>
          </Dropdown>

          {user && (
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" className="flex items-center gap-3">
                <Avatar size={42} className="bg-blue-600 text-white">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </Avatar>
                <DownOutlined />
              </Button>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
}
