/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { message, Avatar, Dropdown, Button, Badge, List } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { logOut } from "@/apis/auth";
import { useAppStore } from "@/stores/useAppStore";
import { getOrderServiceByCode } from "@/apis/order_room";

interface HeaderProps {
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function Header({
  notifications,
  setNotifications,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(notifications.length);

  useEffect(() => {
    setUnreadCount(notifications.length);
  }, [notifications]);

  const handleLogout = async () => {
    try {
      await logOut();
      useAppStore.getState().clearUser();
      message.success("Đăng xuất thành công");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGoProfile = () => router.push("/profile");

  const handleClickNotification = async (item: any) => {
    try {
      const res = await getOrderServiceByCode(item.content_id);
      console.log("Order info:", res.data);
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  const notificationMenu = (
    <List
      className="w-80 max-h-96 overflow-auto"
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleClickNotification(item)}
        >
          {item.content}
        </List.Item>
      )}
    />
  );

  const userMenuItems = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <UserOutlined />,
      onClick: handleGoProfile,
    },
    { type: "divider" as const },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const getPageTitle = () => {
    if (pathname.startsWith("/profile")) return "Trang cá nhân";
    if (pathname.startsWith("/orders")) return "Đơn hàng của tôi";
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/settings")) return "Cài đặt";
    if (pathname.startsWith("/staff")) return "Quản lý nhân viên";
    if (pathname.startsWith("/department")) return "Quản lý phòng ban";
    if (pathname.startsWith("/manage-services")) return "Quản lý dịch vụ";
    return "Trang chủ";
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-linear-to-b from-blue-500 to-blue-600 rounded-full" />
          <h1 className="text-2xl text-gray-800 font-bold tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Dropdown
            overlay={notificationMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <BellOutlined className="text-xl text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
            </Badge>
          </Dropdown>

          {/* User Dropdown */}
          {user && (
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" className="flex items-center gap-3">
                <Avatar size={44} className="bg-blue-500 text-white">
                  {user.first_name?.charAt(0)}
                  {user.last_name?.charAt(0)}
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
