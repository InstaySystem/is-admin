"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/apis/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function NewPasswordPage() {
  const router = useRouter();
  const { resetPasswordToken } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim() || !confirm.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await resetPassword({
        new_password: password,
        reset_password_token: resetPasswordToken,
      });

      if (res.data?.message) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(
          "Không thể đặt lại mật khẩu. Token không hợp lệ hoặc đã hết hạn."
        );
      }
    } catch {
      setError("Có lỗi xảy ra khi đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-black">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 shadow"></div>

      <h1 className="text-center text-3xl font-bold">Đặt lại mật khẩu</h1>
      <p className="text-center text-gray-500 mt-1 mb-8">
        Nhập mật khẩu mới của bạn.
      </p>

      <div className="relative mb-5">
        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full py-3 pl-10 pr-10 bg-gray-100 border rounded-xl 
                     border-gray-300 outline-none focus:ring-2 focus:ring-blue-300"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="relative mb-3">
        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Xác nhận mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full py-3 pl-10 pr-10 bg-gray-100 border rounded-xl 
                     border-gray-300 outline-none focus:ring-2 focus:ring-blue-300"
        />

        <button
          type="button"
          onClick={() => setShowConfirm((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl mb-3 text-sm">
          ✅ Mật khẩu đã được đặt lại thành công!
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-xl text-white font-medium mt-2
                   flex items-center justify-center gap-2
                   bg-linear-to-r from-blue-500 to-blue-600
                   hover:from-blue-600 hover:to-blue-700 transition"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
        ) : (
          "Xác nhận"
        )}
      </button>
    </div>
  );
}
