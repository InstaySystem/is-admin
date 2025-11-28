/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { verifyOrderRoomAdmin } from "@/apis/order_room";
import { message, Spin } from "antd";

export default function VerifyOrderRoomPage() {
  const router = useRouter();
  const params = useParams();
  console.log(params);
  const code = params?.code || "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    const verify = async () => {
      try {
        const res = await verifyOrderRoomAdmin(code);
        console.log(res);
        message.success("Xác nhận đơn phòng thành công!");
        router.replace("/guest/guest-services");
      } catch (err: any) {
        message.error(
          err?.response?.data?.message || "Xác nhận đơn phòng thất bại!"
        );
        router.replace("/welcome");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [code, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Spin size="large" spinning={loading}>
        <div>Đang xác nhận đơn phòng...</div>
      </Spin>
    </div>
  );
}
