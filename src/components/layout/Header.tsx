"use client";

import { usePathname, useRouter } from "next/navigation";
import { Avatar, Dropdown, Button, message } from "antd";
import { LogoutOutlined, UserOutlined, DownOutlined } from "@ant-design/icons";
import { logOut } from "@/apis/auth";
import { useAppStore } from "@/stores/useAppStore";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((state) => state.user);

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

  // 🔥 NEW — menu dùng items thay vì overlay
  const menuItems = [
    {
      key: "profile",
      label: <span className="font-medium text-gray-700">Hồ sơ cá nhân</span>,
      icon: <UserOutlined className="text-base" />,
      onClick: handleGoProfile,
      className: "!mx-2 !rounded-lg !py-3 hover:!bg-blue-50 transition-all",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: <span className="font-medium text-red-600">Đăng xuất</span>,
      icon: <LogoutOutlined className="text-base text-red-600" />,
      danger: true,
      onClick: handleLogout,
      className: "!mx-2 !rounded-lg !py-3 hover:!bg-red-50 transition-all",
      type: "item" as const,
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

        {user && (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              className="flex! items-center gap-3 px-4! py-2! !h-auto! hover:bg-gray-50! rounded-xl! transition-all duration-200 group border border-transparent hover:border-gray-200!"
            >
              <Avatar
                className="bg-linear-to-br! !from-blue-500! to-blue-600! text-white! shadow-md! group-hover:shadow-lg! transition-shadow"
                size={44}
              >
                <span className="text-base font-semibold">
                  {user.first_name?.charAt(0).toUpperCase()}
                  {user.last_name?.charAt(0).toUpperCase()}
                </span>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-gray-800 text-sm">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-xs text-gray-500">
                  {user.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                </span>
              </div>
              <DownOutlined className="text-gray-400 text-xs group-hover:text-gray-600 transition-colors" />
            </Button>
          </Dropdown>
        )}
      </div>
    </header>
  );
}
