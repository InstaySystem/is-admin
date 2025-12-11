/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { verifyOrderRoomAdmin } from "@/apis/order_room";
import { Spin } from "antd";
import { useMessage } from "@/app/providers/MessageProvider";

export default function VerifyOrderRoomPage() {
  const router = useRouter();
  const params = useParams();
  console.log(params);
  const code = params?.code?.toString();
  const [loading, setLoading] = useState(true);

  const msg = useMessage();

  useEffect(() => {
    if (!code) return;

    const verify = async () => {
      try {
        const res = await verifyOrderRoomAdmin(code);
        msg.success(res.data.message);
        router.replace("/guest");
      } catch (err: any) {
        msg.error(err || "Xác nhận đơn phòng thất bại!");
        router.replace("/guest");
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
