/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { createOrderRoomAdmin } from "@/apis/order_room";
import { Select, Button, message, Card, Spin } from "antd";
import { Room } from "@/types/room";
import { Booking } from "@/types/booking";
import { getBookings } from "@/apis/booking";
import { getRooms } from "@/apis/room";
import { useAppStore } from "@/stores/useAppStore";
import CustomAlert from "@/components/ui/CustomAlert";

export default function CreateOrderForm() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { setUrlQrCode } = useAppStore();
  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const [messageApi, contextHolder] = message.useMessage();

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const roomsRes = await getRooms();
        setRooms(roomsRes.data.data.rooms);

        const bookingsRes = await getBookings();
        setBookings(bookingsRes.data.data.bookings);
      } catch (err: any) {
        messageApi.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!bookingId || !roomId) {
      showAlert("error", "Vui lòng chọn đủ Booking và Room!");
      return;
    }

    setLoading(true);

    try {
      const res = await createOrderRoomAdmin({
        booking_id: bookingId,
        room_id: roomId,
      });

      const orderId = res.data.data.id;
      const qrCodeUrl = res.data.data.secret_code;
      setUrlQrCode(qrCodeUrl);

      messageApi.success(res.data.message);
      window.location.href = `/order-rooms/detail/${orderId}?qr=${encodeURIComponent(
        typeof qrCodeUrl === "string" ? qrCodeUrl : res.data.data.secret_code
      )}`;
    } catch (err: any) {
      messageApi.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <Spin tip="Đang tải dữ liệu..." />;

  return (
    <>
      {contextHolder}
      <Card className="max-w-xl w-full shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Tạo đơn phòng</h2>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Chọn Booking</label>
          <Select
            className="w-full"
            size="large"
            placeholder="Chọn booking..."
            onChange={(value) => setBookingId(value)}
            options={bookings.map((b) => ({
              label: `${b.guest_name} — (${b.booking_number})`,
              value: b.id,
            }))}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Chọn Phòng</label>
          <Select
            className="w-full"
            size="large"
            placeholder="Chọn phòng..."
            onChange={(value) => setRoomId(value)}
            options={rooms.map((r) => ({
              label: `${r.name} — ${r.room_type?.name || "N/A"} (Tầng ${
                r.floor || "N/A"
              })`,
              value: r.id,
            }))}
          />
        </div>

        <Button
          type="primary"
          size="large"
          className="w-full"
          onClick={handleCreate}
          loading={loading}
        >
          Tạo đơn phòng
        </Button>

        <CustomAlert
          open={alert.open}
          type={alert.type}
          message={alert.message}
        />
      </Card>
    </>
  );
}
