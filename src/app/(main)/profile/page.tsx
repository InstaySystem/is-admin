/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  FaPen,
  FaIdCard,
  FaUser,
  FaUserShield,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { getMe, updateInfo, changePassword } from "@/apis/auth";
import DepartmentModal from "./components/DepartmentModal";
import ChangePasswordModal from "./components/ChangePasswordForm";
import { Department, UpdateInforRequest, User } from "@/types/user";
import CustomAlert from "@/components/ui/CustomAlert";
import { Button, CircularProgress } from "@mui/material";
import { message } from "antd";

export default function ProfilePage() {
  const [user, setUser] = useState<User>();
  const [formData, setFormData] = useState<UpdateInforRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMe();
        const userData = res?.data?.data?.user;
        if (userData) {
          setUser(userData);
          setFormData({
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });
          showAlert("success", res.data.message);
        }
      } catch (error: any) {
        showAlert("error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateInfo = async (formData: UpdateInforRequest) => {
    try {
      setLoading(true);
      const res = await updateInfo(formData);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...formData,
            }
          : prev
      );
      showAlert("success", res.data.message);
    } catch (error: any) {
      showAlert("error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitChangePassword = async (values: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    if (values.new_password !== values.confirm_password) {
      messageApi.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setChangePassLoading(true);
      const res = await changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      });

      messageApi.success(res.data.message || "Đổi mật khẩu thành công");
      setIsChangePassOpen(false);
    } catch (err: any) {
      messageApi.error(err || "Đổi mật khẩu thất bại");
    } finally {
      setChangePassLoading(false);
    }
  };

  const handleDepartmentUpdated = (updatedDepartment?: Department) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            department: updatedDepartment,
          }
        : prev
    );
  };

  return (
    <div className="flex flex-col px-3 md:px-0">
      {contextHolder}

      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />

      <div className="flex justify-center items-start md:items-center text-black relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <CircularProgress size="3rem" />
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-4 md:p-10 w-full max-w-4xl">
          {/* AVATAR + NAME */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6 md:mb-10">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#608dbc] flex items-center justify-center text-white text-3xl font-bold">
              {user?.first_name?.charAt(0) || "U"}
              {user?.last_name?.charAt(0) || ""}
            </div>

            <div className="w-full">
              <p className="text-gray-700 font-semibold flex items-center gap-2">
                Họ và Tên :
                <FaPen className="text-gray-500 text-sm" />
              </p>
              <div className="flex flex-col md:flex-row gap-3 mt-1 w-full">
                <input
                  type="text"
                  name="first_name"
                  placeholder="Họ"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Tên"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* GRID CONTENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="bg-[#B0CBE8] rounded-lg p-6 space-y-4">
              <div>
                <p className="text-gray-700 font-medium flex items-center gap-2">
                  <FaPen className="text-gray-600 text-sm" />
                  Email nhân viên :
                </p>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <p className="text-gray-700 font-medium flex items-center gap-2">
                  <FaPen className="text-gray-600 text-sm" />
                  Số điện thoại :
                </p>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-white mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsChangePassOpen(true)}
                  className="w-full sm:w-auto bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                  Đổi mật khẩu
                </button>

                <button
                  onClick={() => handleUpdateInfo(formData)}
                  className="w-full sm:w-auto bg-[#608DBC] text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Lưu
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="bg-[#B0CBE8] rounded-lg p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Thông tin chi tiết
              </h2>

              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm">
                <FaIdCard />
                <span className="font-medium">Mã nhân viên:</span>
                <span>{user?.id}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm">
                  <FaUser />
                  <span className="font-medium">Username:</span>
                  <span>{user?.username}</span>
                </div>

                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm">
                  <FaUserShield />
                  <span className="font-medium">Vai trò:</span>
                  <span>{user?.role}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                    user?.is_active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.is_active ? <FaToggleOn /> : <FaToggleOff />}
                  <span>
                    {user?.is_active ? "Đang hoạt động" : "Ngưng hoạt động"}
                  </span>
                </div>

                {user?.department ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Xem phòng ban
                  </Button>
                ) : (
                  <span className="text-gray-500 italic text-sm">
                    Không có phòng ban
                  </span>
                )}
              </div>
            </div>
          </div>

          <DepartmentModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            userId={user?.id}
            department={user?.department}
            onUpdated={handleDepartmentUpdated}
          />

          <ChangePasswordModal
            open={isChangePassOpen}
            loading={changePassLoading}
            onClose={() => setIsChangePassOpen(false)}
            onSubmit={handleSubmitChangePassword}
          />
        </div>
      </div>
    </div>
  );
}
