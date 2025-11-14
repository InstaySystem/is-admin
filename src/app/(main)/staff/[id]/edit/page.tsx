/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaPen } from "react-icons/fa";
import { getUserById, updateUser, getRoles, deleteUser } from "@/apis/user";
import { Department, UpdateUserRequest, User } from "@/types/user";
import DepartmentModal from "@/app/(main)/profile/components/DepartmentModal";
import CustomAlert from "@/components/ui/CustomAlert";
import { Button, CircularProgress, Switch } from "@mui/material";
import CommonModal from "@/components/modals/CommonModal";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const [user, setUser] = useState<User>();
  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [roles, setRoles] = useState<string[]>();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getUserById(userId);
      const userData = res?.data?.data.user;
      if (userData) {
        setUser(userData);
        setFormData({
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          is_active: userData.is_active,
          department_id: userData.department?.id,
        });
      }
    } catch (error: any) {
      showAlert("error", error.message || "Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data.data.roles);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await deleteUser(userId);
      showAlert("success", res.data.message);
    } catch (error: any) {
      showAlert("error", error.message);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchRoles();
  }, []);

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  const handleDepartmentUpdated = (
    updatedDepartment?: Department,
    departmentId?: number
  ) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            department: updatedDepartment,
          }
        : prev
    );
    setFormData((prev) => ({
      ...prev,
      department_id: departmentId,
    }));
  };

  const handleUpdateInfo = async () => {
    try {
      setLoading(true);
      const res = await updateUser(userId, formData);
      setUser((prev) => (prev ? { ...prev, ...formData } : prev));
      showAlert("success", res.data.message || "Cập nhật thành công");
      fetchUser();
    } catch (error: any) {
      showAlert("error", error.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    router.push(`/staff/${userId}/change-password`);
  };

  return (
    <div className="flex flex-col">
      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />

      <div className="flex justify-center items-center text-black relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <CircularProgress size="3rem" />
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-10 w-full max-w-4xl">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              {user?.first_name?.charAt(0) || "U"}
              {user?.last_name?.charAt(0) || ""}
            </div>
            <div>
              <p className="text-gray-700 font-semibold flex items-center gap-2">
                Họ và Tên:
                <FaPen className="text-gray-500 text-sm" />
              </p>
              <div className="flex gap-3 mt-1">
                <input
                  type="text"
                  name="first_name"
                  placeholder="Họ"
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Tên"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-100 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin chi tiết
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-medium">Tài khoản</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium">
                  Ngày gia nhập
                </label>
                <input
                  type="text"
                  value={
                    user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("vi-VN")
                      : ""
                  }
                  disabled
                  className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium block">
                  Vai trò
                </label>
                <select
                  value={formData.role || "staff"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value as "staff" | "admin",
                    }))
                  }
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ height: "42px" }}
                >
                  {Object.entries(roles || {}).map(([label, value]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-1">
                <span className="text-gray-700 font-medium text-[15px]">
                  Trạng thái
                </span>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_active ?? false}
                    onChange={(e) => handleSwitchChange(e.target.checked)}
                    color="primary"
                  />

                  <span
                    className={`font-semibold text-sm px-3 py-1 rounded-full ${
                      formData.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {formData.is_active ? "Đang làm" : "Nghỉ làm"}
                  </span>
                </div>
              </div>

              <Button
                variant="outlined"
                className="border-blue-400! text-blue-600! cursor-pointer"
                onClick={() => setIsModalOpen(true)}
                disabled={!user?.department}
              >
                Xem phòng ban
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition"
            >
              Xóa
            </button>

            <div className="flex justify-end items-center gap-3 mt-6">
              <button
                onClick={handleChangePassword}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Đổi mật khẩu
              </button>

              <button
                onClick={handleUpdateInfo}
                className="bg-[#608DBC] text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>

          <DepartmentModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            userId={user?.id}
            department={user?.department}
            onUpdated={handleDepartmentUpdated}
            onSuccess={(msg) => showAlert("success", msg)}
            onError={(msg) => showAlert("error", msg)}
          />

          <CommonModal
            open={isDeleteModalOpen}
            title="Bạn có chắc chắn muốn xóa nhân viên này không?"
            onClose={() => setIsDeleteModalOpen(false)}
            onOk={handleDeleteUser}
          />
        </div>
      </div>
    </div>
  );
}
