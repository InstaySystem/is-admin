/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBookingById } from "@/apis/booking";
import { Booking } from "@/types/booking";
import { Descriptions, Spin, Divider, Button } from "antd";
import dayjs from "dayjs";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await getBookingById(bookingId);
        setBooking(res.data.data.booking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading || !booking) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f5f5f5] min-h-screen">
      <div className="bg-[#B0CBE8] p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Booking Detail</h2>
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

        <Divider className="my-6" />

        <div className="text-right">
          <Button
            onClick={() => router.back()}
            type="primary"
            className="bg-[#608DBC]!"
          >
            Back to List
          </Button>
        </div>
      </div>
    </div>
  );
}
