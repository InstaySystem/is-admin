"use client";

import { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-200 to-blue-400 flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex w-1/2 relative">
          <Image
            src="/images/auth_bg.png"
            alt="hotel"
            width={500}
            height={500}
            className="w-full h-full object-cover"
          />

          <div className="absolute p-10 flex flex-col justify-start text-white drop-shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl shadow-md"></div>
              <div>
                <h2 className="text-xl font-semibold">Dela Sol Hotel</h2>
                <p className="text-sm opacity-80 mt-1">Sapa, Vietnam</p>
              </div>
            </div>

            <h1 className="text-3xl font-bold mt-6 leading-tight">
              Chào mừng đến với <br /> Hệ thống Quản lý
            </h1>
          </div>
        </div>

        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
