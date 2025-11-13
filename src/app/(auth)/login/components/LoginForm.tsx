"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { login } from "@/apis/auth";
import { useRouter } from "next/navigation";
import { FaUser, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import { useAppStore } from "@/stores/useAppStore";

const schema = yup.object().shape({
  username: yup.string().required("Vui lòng nhập username"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

interface IFormInput {
  username: string;
  password: string;
}

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormInput>({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAppStore();

  const togglePassword = () => setShowPassword((prev) => !prev);

  const onSubmit = async (data: IFormInput) => {
    try {
      const res = await login(data);
      console.log(res.data.data.user);
      setUser(res.data.data.user);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="text-black">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 shadow-md"></div>

      <h1 className="text-center text-2xl font-bold">Instay Admin</h1>
      <p className="text-center text-gray-500 text-sm mt-1 mb-8">
        Đăng nhập để tiếp tục
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

          <input
            {...register("username")}
            placeholder="Username"
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-blue-300
                       border-gray-300 bg-gray-100"
          />

          <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg 
                       outline-none focus:ring focus:ring-blue-300
                       border-gray-300 bg-gray-100"
          />

          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                       text-gray-600 hover:text-black transition"
          >
            {showPassword ? (
              <FaEyeSlash className="text-lg" />
            ) : (
              <FaEye className="text-lg" />
            )}
          </button>

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            Ghi nhớ đăng nhập
          </label>

          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-blue-600 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-400 text-white py-4 rounded-lg 
                     font-medium hover:bg-blue-700 transition flex gap-2 justify-center items-center text-lg"
        >
          <FiLogIn />
          {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="text-center text-sm mt-6">
        Cần hỗ trợ?{" "}
        <span className="text-blue-600 cursor-pointer hover:underline">
          Liên hệ chúng tôi
        </span>
      </div>
    </div>
  );
}
