/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { message, Avatar, Dropdown, Button, Badge, List, Drawer } from "antd";
import { UserOutlined, DownOutlined } from "@ant-design/icons";

import {
  countUnreadNotificationsForGuest,
  getNotificationsForGuest,
} from "@/apis/notification";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { IoNotificationsOutline } from "react-icons/io5";
import { useMessageStore } from "@/stores/useMessageStore";

export default function HeaderGuest() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { messages } = useMessageStore();
  const unreadMessagesCount = messages.length;

  const { notifications, unreadCount, setNotifications, setUnreadCount } =
    useNotificationStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

      if (isMobile) {
        setIsDrawerOpen(false);
      }
    } catch (err) {
      console.error(err);
      message.error("Không tìm thấy thông báo!");
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (isMobile) {
      if (open) {
        try {
          const res = await getNotificationsForGuest();
          setNotifications(res.data.data.notifications || []);
          setUnreadCount(0);
          setIsDrawerOpen(true);
        } catch (err) {
          console.error(err);
          message.error("Không thể tải thông báo!");
        }
      }
    } else {
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
    }
  };

  const handleDrawerClose = async () => {
    setIsDrawerOpen(false);
    try {
      const res = await countUnreadNotificationsForGuest();
      setUnreadCount(res.data.data?.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const notificationList = (
    <List
      className="w-full max-h-[70vh] md:max-h-96 overflow-auto bg-white"
      dataSource={notifications}
      locale={{ emptyText: "Không có thông báo" }}
      renderItem={(item) => (
        <List.Item
          className={`cursor-pointer px-4! py-3! transition-all ${
            item.is_read === null
              ? "bg-blue-50 hover:bg-blue-100"
              : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => handleClickNotification(item)}
        >
          <div className="flex flex-col text-gray-900 font-medium w-full">
            <div className="break-words">{item.content}</div>
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

  const notificationMenu = (
    <div className="w-80 max-h-96 overflow-hidden bg-white rounded-md shadow-lg">
      {notificationList}
    </div>
  );

  const handleNotificationClick = () => {
    if (isMobile) {
      handleOpenChange(true);
    }
  };

  return (
    <>
      <header className="w-full bg-white shadow-md border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow" />
            <h1 className="text-xl md:text-2xl text-gray-900 font-semibold tracking-tight">
              GUEST PAGE
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {isMobile ? (
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <IoNotificationsOutline
                  className="text-2xl cursor-pointer text-gray-600 hover:text-blue-600"
                  onClick={handleNotificationClick}
                />
              </Badge>
            ) : (
              <Dropdown
                overlay={notificationMenu}
                trigger={["click"]}
                placement="bottomRight"
                onOpenChange={handleOpenChange}
              >
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                  <IoNotificationsOutline className="text-2xl cursor-pointer text-gray-600 hover:text-blue-600" />
                </Badge>
              </Dropdown>
            )}

            <Dropdown menu={{ items: [] }} placement="bottomRight">
              <Button
                type="text"
                className="flex items-center gap-2 md:gap-3 hover:bg-gray-100 px-2 py-1 rounded-lg transition"
              >
                <Avatar size={42} className="bg-blue-600 text-white shadow">
                  GU
                </Avatar>
              </Button>
            </Dropdown>
          </div>
        </div>
      </header>

      <Drawer
        title="Thông báo"
        placement="right"
        onClose={handleDrawerClose}
        open={isDrawerOpen}
        width="100%"
        className="md:hidden"
        styles={{
          body: { padding: 0 },
        }}
      >
        {notificationList}
      </Drawer>
    </>
  );
}
