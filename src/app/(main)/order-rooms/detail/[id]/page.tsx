/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getOrderRoomById } from "@/apis/order_room";
import QRCodeCard from "../../components/QrCodeCard";
import { Button, Card, Descriptions, Spin } from "antd";

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = Number(params.id);
  const qrCodeUrl = searchParams.get("qr");

  const [order, setOrder] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await getOrderRoomById(orderId);
        setOrder(res.data.data.order_room);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) return <Spin tip="Đang tải..." className="mt-10" />;

  if (!order)
    return <p className="text-black mt-10">Không tìm thấy đơn phòng</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6 text-black">
        Order detail #{orderId}
      </h1>
      <Button
        type="default"
        className="mb-4"
        onClick={() => router.push(`/manage-booking/${order.booking?.id}`)}
      >
        Booking
      </Button>

      <Card className="mb-6 shadow-lg">
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Booking Number" className="text-black">
            {order.booking?.booking_number || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Guest Name" className="text-black">
            {order.booking?.guest_name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Booked On" className="text-black">
            {order.booking?.booked_on
              ? new Date(order.booking.booked_on).toLocaleDateString()
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Check In" className="text-black">
            {order.booking?.check_in
              ? new Date(order.booking.check_in).toLocaleString()
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Check Out" className="text-black">
            {order.booking?.check_out
              ? new Date(order.booking.check_out).toLocaleString()
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Room" className="text-black">
            {order.room?.name || "-"} — {order.room?.room_type?.name || "-"}{" "}
            (Tầng {order.room?.floor || "-"})
          </Descriptions.Item>
          <Descriptions.Item label="Created By" className="text-black">
            {order.created_by?.first_name} {order.created_by?.last_name} (
            {order.created_by?.username})
          </Descriptions.Item>
          <Descriptions.Item label="Created At" className="text-black">
            {order.created_at
              ? new Date(order.created_at).toLocaleString()
              : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {qrCodeUrl && (
        <div className="mt-4 flex justify-center">
          <QRCodeCard code={qrCodeUrl} />
        </div>
      )}
    </div>
  );
}
