/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Spin, message } from "antd";
import dayjs from "dayjs";
import { getOrderSchedule } from "@/apis/order_room";

// ================= TYPES =================
type Booking = {
  id: number;
  booking_number: string;
  check_in: string;
  check_out: string;
};

type OrderRoom = {
  id: number;
  booking: Booking;
};

type Room = {
  id: number;
  name: string;
  order_rooms: OrderRoom[];
};

// ================= TOOLTIP =================
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded shadow text-sm border">
        <p className="font-semibold text-gray-800">Phòng: {d.roomName}</p>
        <p className="text-xs text-gray-600">Mã booking: {d.bookingNumber}</p>
        <p className="text-xs text-gray-600">Check-in: {d.checkInText}</p>
        <p className="text-xs text-gray-600">Check-out: {d.checkOutText}</p>
      </div>
    );
  }
  return null;
};

export default function BookingSchedulePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await getOrderSchedule();
      setRooms(res.data.data.rooms || []);
    } catch {
      message.error("Không tải được lịch phòng");
    } finally {
      setLoading(false);
    }
  };

  const { minTime, maxTime } = useMemo(() => {
    if (!rooms.length) {
      const now = dayjs().startOf("day").valueOf();
      return { minTime: now, maxTime: now + 86400000 };
    }

    let min = Infinity;
    let max = 0;

    rooms.forEach((r) => {
      const booking = r.order_rooms[0]?.booking;
      if (!booking) return;

      const ci = dayjs(booking.check_in).startOf("day").valueOf();
      const co = dayjs(booking.check_out).endOf("day").valueOf();

      if (ci < min) min = ci;
      if (co > max) max = co;
    });

    return { minTime: min, maxTime: max };
  }, [rooms]);

  const totalRange = maxTime - minTime;

  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    let current = minTime;

    while (current <= maxTime) {
      ticks.push(current - minTime);
      current += 86400000;
    }

    return ticks;
  }, [minTime, maxTime]);

  const chartData = useMemo(() => {
    return rooms.map((room) => {
      const booking = room.order_rooms[0]?.booking;

      if (!booking) {
        return {
          roomName: room.name,
          start: 0,
          duration: 0,
          color: "#ccc",
          bookingNumber: "",
          checkInText: "",
          checkOutText: "",
        };
      }

      const checkInTs = dayjs(booking.check_in).valueOf();
      const checkOutTs = dayjs(booking.check_out).valueOf();

      const start = checkInTs - minTime;
      const duration = checkOutTs - checkInTs;

      const color = checkInTs <= dayjs().valueOf() ? "#7c3aed" : "#3b82f6";

      return {
        roomName: room.name,
        start,
        duration,
        color,
        bookingNumber: booking.booking_number,
        checkInText: dayjs(booking.check_in).format("DD/MM/YYYY HH:mm"),
        checkOutText: dayjs(booking.check_out).format("DD/MM/YYYY HH:mm"),
      };
    });
  }, [rooms, minTime]);

  const todayOffset = Math.max(0, dayjs().startOf("day").valueOf() - minTime);

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex justify-center items-center h-[360px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="w-full h-[520px] bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Timeline sử dụng phòng theo ngày
          </h2>

          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 40, left: 120, bottom: 20 }}
            >
              {/* TRỤC X THEO TỪNG NGÀY */}
              <XAxis
                type="number"
                domain={[0, totalRange]}
                ticks={xTicks}
                tickFormatter={(v) => dayjs(minTime + v).format("DD/MM")}
              />

              <YAxis dataKey="roomName" type="category" width={120} />

              <Tooltip content={<CustomTooltip />} />

              {/* VẠCH HÔM NAY */}
              <ReferenceLine
                x={todayOffset}
                stroke="red"
                strokeDasharray="4 4"
              />

              {/* BAR OFFSET */}
              <Bar
                dataKey="start"
                stackId="a"
                fill="transparent"
                isAnimationActive={false}
              />

              {/* BAR THỜI GIAN LƯU TRÚ */}
              <Bar
                dataKey="duration"
                stackId="a"
                radius={[6, 6, 6, 6]}
                isAnimationActive={false}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* LEGEND */}
          <div className="mt-3 flex gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-2 rounded-sm bg-[#7c3aed] inline-block" />
              <span className="text-gray-600">Đang ở / Quá khứ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-2 rounded-sm bg-[#3b82f6] inline-block" />
              <span className="text-gray-600">Tương lai</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
