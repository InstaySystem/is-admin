"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp } from "@/apis/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { FaPaperPlane } from "react-icons/fa";

export default function VerifyPage() {
  const router = useRouter();
  const { forgotPasswordToken, setResetPasswordToken } = useAuthStore();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyOtp({
        forgot_password_token: forgotPasswordToken,
        otp,
      });

      const token = res.data.data.reset_password_token;
      setResetPasswordToken(token);

      setSuccess(true);

      setTimeout(() => {
        router.push("/new-password");
      }, 1200);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-black">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 shadow"></div>
      <h1 className="text-center text-3xl font-bold">Xác minh OTP</h1>
      <p className="text-center text-gray-500 mt-1 mb-8">
        Vui lòng nhập mã OTP đã được gửi đến email của bạn.
      </p>
      <div className="mb-4">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          placeholder="______"
          className="w-full text-center tracking-[12px] text-2xl font-semibold 
                     py-3 border rounded-xl bg-gray-100 border-gray-300 
                     outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-3 text-sm text-left">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl mb-3 text-sm text-left">
          ✅ Xác minh thành công! Đang chuyển hướng...
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2
                   bg-linear-to-r from-blue-500 to-blue-600 
                   hover:from-blue-600 hover:to-blue-700 transition"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
        ) : (
          <>
            <FaPaperPlane className="text-sm" />
            Xác minh
          </>
        )}
      </button>
    </div>
  );
}
