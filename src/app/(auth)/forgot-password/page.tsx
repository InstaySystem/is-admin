"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/apis/auth";
import { useAuthStore } from "@/stores/useAuthStore";

import {
  FaUser,
  FaInfoCircle,
  FaArrowLeft,
  FaPaperPlane,
} from "react-icons/fa";

const schema = yup.object().shape({
  email: yup.string().required("Vui lòng nhập username"),
});

interface ForgotPasswordInput {
  email: string;
}

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const { setForgotPasswordToken } = useAuthStore();

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const res = await forgotPassword(data.email);
      const token = res.data.data.forgot_password_token;
      setForgotPasswordToken(token);
      setTimeout(() => {
        router.push("/forgot-password/verify");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-black">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 shadow"></div>

      <h1 className="text-center text-3xl font-bold">Quên mật khẩu</h1>
      <p className="text-center text-gray-500 mt-1 mb-8">
        Nhập username để khôi phục mật khẩu
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

          <input
            {...register("email")}
            placeholder="Email"
            className="w-full py-4 pl-10 pr-10 border rounded-xl bg-gray-100 border-gray-300 outline-none focus:ring-2 focus:ring-blue-300"
          />

          <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
          <FaInfoCircle className="text-blue-600 text-lg mt-1" />
          <p className="text-blue-700 text-sm leading-relaxed">
            Chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến email đã đăng ký của
            bạn.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2
          bg-linear-to-r from-blue-300 to-blue-400 hover:from-blue-600 hover:to-blue-700 transition"
        >
          <FaPaperPlane className="text-sm" />
          {isSubmitting ? "Đang gửi..." : "Gửi OTP"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full py-3 rounded-xl border border-blue-300 text-blue-600 font-medium 
                     hover:bg-blue-50 transition flex items-center justify-center gap-2"
        >
          <FaArrowLeft />
          Quay lại đăng nhập
        </button>
      </form>
    </div>
  );
}
