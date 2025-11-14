"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaPen,
  FaIdCard,
  FaUser,
  FaUserShield,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { getMe } from "@/apis/auth";
import DepartmentModal from "./components/DepartmentModal";
import { Department, UpdateInforRequest, User } from "@/types/user";
import { updateInfo } from "@/apis/auth";
import CustomAlert from "@/components/ui/CustomAlert";
import { Button, CircularProgress } from "@mui/material";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [formData, setFormData] = useState<UpdateInforRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      setUser((prev: User | undefined): User | undefined => {
        if (!prev) return prev;
        return {
          ...prev,
          ...formData,
        };
      });
      showAlert("success", res.data.message);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showAlert("error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleDepartmentUpdated = (updatedDepartment?: Department) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        department: updatedDepartment,
      };
    });
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
            {loading && <CircularProgress size="3rem" />}

            <div>
              <p className="text-gray-700 font-semibold flex items-center gap-2">
                Họ và Tên :
                <FaPen className="text-gray-500 text-sm" />
              </p>
              <div className="flex gap-3 mt-1">
                <input
                  type="text"
                  name="first_name"
                  placeholder="Họ"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Tên"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- Cột trái: Form chỉnh sửa --- */}
            <div className="bg-blue-200 rounded-lg p-6 space-y-4">
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

              <div className="flex justify-end items-center gap-3 mt-6">
                <button
                  onClick={handleChangePassword}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                  Đổi mật khẩu
                </button>

                <button
                  onClick={() => handleUpdateInfo(formData)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Lưu
                </button>
              </div>
            </div>

            {/* --- Cột phải: Thông tin chi tiết --- */}
            <div className="bg-blue-100 rounded-lg p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Thông tin chi tiết
              </h2>

              {/* Mã nhân viên */}
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm">
                <FaIdCard className="text-blue-600 flex-shrink-0" />
                <span className="font-medium flex-shrink-0">Mã nhân viên:</span>
                <span>{user?.id}</span>
              </div>

              {/* Tài khoản */}

              {/* Vai trò + Nút phòng ban */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm">
                  <FaUser className="text-green-600 shrink-0" />
                  <span className="font-medium shrink-0">Username:</span>
                  <span>{user?.username}</span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm flex-1">
                  <FaUserShield className="text-yellow-600 shrink-0" />
                  <span className="font-medium shrink-0">Vai trò:</span>
                  <span>{user?.role}</span>
                </div>
              </div>

              {/* Trạng thái */}
              <div className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                    user?.is_active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.is_active ? (
                    <FaToggleOn className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <FaToggleOff className="text-red-600 flex-shrink-0" />
                  )}
                  <span className="font-medium flex-shrink-0">Trạng thái:</span>
                  <span>
                    {user?.is_active ? "Hoạt động" : "Ngưng hoạt động"}
                  </span>
                </div>

                {user?.department ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setIsModalOpen(true)}
                    className="ml-2 text-sm px-3 py-1"
                  >
                    Xem phòng ban
                  </Button>
                ) : (
                  <span className="text-gray-500 italic text-sm ml-2">
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
        </div>
      </div>
    </div>
  );
}
