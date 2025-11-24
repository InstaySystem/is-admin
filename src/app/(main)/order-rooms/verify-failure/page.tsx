"use client";
import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function VerifyFailure() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Xác nhận thất bại!
      </h1>
      <p className="mb-6">
        Có lỗi xảy ra khi xác nhận đơn phòng. Vui lòng thử lại.
      </p>
      <Button type="primary" onClick={() => router.push("/order-rooms")}>
        Quay về trang chủ
      </Button>
    </div>
  );
}
