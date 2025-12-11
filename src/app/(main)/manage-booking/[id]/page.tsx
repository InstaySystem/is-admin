/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBookingById } from "@/apis/booking";
import { Booking } from "@/types/booking";
import { Descriptions, Spin, Divider, Button } from "antd";
import { List } from "antd";
import dayjs from "dayjs";
import CreateOrderRoomModal from "../../order-rooms/components/CreateOrderRoomModal";
import { Room } from "@/types/room";
import { getRooms } from "@/apis/room";
import { createOrderRoomAdmin } from "@/apis/order_room";
import { useMessage } from "@/app/providers/MessageProvider";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  const msg = useMessage();

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await getBookingById(bookingId);
        setBooking(res.data.data.booking);
      } catch (err: any) {
        msg.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!booking?.room_type) return;

    const fetchRooms = async () => {
      try {
        setLoading(true);

        const res = await getRooms({
          in_use: false,
          room_type_name: booking.room_type,
        });

        setRooms(res.data.data.rooms);
      } catch (err: any) {
        msg.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [booking?.room_type]);

  const handleCreateOrder = async (roomId: number) => {
    if (!booking) return;

    try {
      const res = await createOrderRoomAdmin({
        booking_id: booking.id,
        room_id: roomId,
      });

      const orderId = res.data.data.id;
      const qr = res.data.data.secret_code;

      msg.success(res.data.message);

      router.push(
        `/order-rooms/detail/${orderId}?qr=${encodeURIComponent(qr)}`
      );
    } catch (err: any) {
      msg.error(err);
    } finally {
      setModalOpen(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f5f5f5] min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-black font-bold">Chi tiết booking</h2>
        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={() => setModalOpen(true)}
        >
          Tạo đơn đặt phòng
        </Button>
      </div>

      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ width: "200px", fontWeight: "500" }}
        contentStyle={{ fontWeight: "400" }}
      >
        <Descriptions.Item label="Booking Number">
          {booking.booking_number}
        </Descriptions.Item>
        <Descriptions.Item label="Guest Name">
          {booking.guest_full_name}
        </Descriptions.Item>
        <Descriptions.Item label="Guest Email">
          {booking.guest_email || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Guest Phone">
          {booking.guest_phone || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Guest Number">
          {booking.guest_number || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Room Type">
          {booking.room_type || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Room Number">
          {booking.room_number || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Check In">
          {dayjs(booking.check_in).format("YYYY-MM-DD HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Check Out">
          {dayjs(booking.check_out).format("YYYY-MM-DD HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Booked On">
          {dayjs(booking.booked_on).format("YYYY-MM-DD")}
        </Descriptions.Item>
        <Descriptions.Item label="Source">{booking.source}</Descriptions.Item>
        <Descriptions.Item label="Promotion">
          {booking.promotion_name || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Meal Plan">
          {booking.meal_plan || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Booking Conditions">
          {booking.booking_conditions || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Total Net Price">
          {booking.total_net_price?.toLocaleString() || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Total Sell Price">
          {booking.total_sell_price?.toLocaleString() || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Booking References">
          {booking.booking_references || "—"}
        </Descriptions.Item>
      </Descriptions>

      {booking.order_rooms && booking.order_rooms.length > 0 ? (
        <>
          <Divider />
          <h3 className="text-lg font-semibold mb-3 text-black">
            Danh sách đơn phòng ({booking.order_rooms?.length || 0})
          </h3>
          <List
            bordered
            dataSource={booking.order_rooms}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    key="view"
                    onClick={() =>
                      router.push(`/order-rooms/detail/${item.id}`)
                    }
                  >
                    Xem chi tiết
                  </Button>,
                ]}
              >
                <div className="flex flex-col">
                  <span>
                    <b>Mã đơn:</b> {item.id}
                  </span>

                  <span>
                    <b>Phòng:</b> {item.room?.name} — Tầng{" "}
                    {item.room?.floor || "N/A"}
                  </span>

                  <span>
                    <b>Loại:</b> {item.room?.room_type?.name || "N/A"}
                  </span>
                </div>
              </List.Item>
            )}
          />
        </>
      ) : (
        <></>
      )}

      <CreateOrderRoomModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreateOrder}
        rooms={rooms}
      />
    </div>
  );
}
