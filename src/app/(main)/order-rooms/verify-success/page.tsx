"use client";
import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function VerifySuccess() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        Xác nhận thành công!
      </h1>
      <p className="mb-6">Đơn phòng đã được xác nhận thành công.</p>
      <Button type="primary" onClick={() => router.push("/order-rooms")}>
        Quay về trang chủ
      </Button>
    </div>
  );
}
