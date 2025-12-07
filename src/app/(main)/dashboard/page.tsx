/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { getDashboardData } from "@/apis/dashboard";
import { PieChart, LineChart, BarChart } from "@mui/x-charts";
import { Card } from "@mui/material";
import {
  FaBed,
  FaUsers,
  FaConciergeBell,
  FaBook,
  FaStar,
  FaMoneyBillWave,
} from "react-icons/fa";

export default function DashBoardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await getDashboardData();
      setData(res?.data.data?.dashboard);
    })();
  }, []);

  const serviceUsageSorted = useMemo(() => {
    if (!data) return [];
    return [...data.service_usage_stats].sort(
      (a: any, b: any) => a.value - b.value
    );
  }, [data]);

  if (!data) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Rooms" value={data.total_rooms} icon={<FaBed />} />
        <StatCard title="Staff" value={data.total_staff} icon={<FaUsers />} />
        <StatCard
          title="Services"
          value={data.total_services}
          icon={<FaConciergeBell />}
        />
        <StatCard
          title="Bookings"
          value={data.total_bookings}
          icon={<FaBook />}
        />
        <StatCard
          title="Rating"
          value={data.average_review_rating}
          suffix=" ⭐"
          icon={<FaStar />}
        />
        <StatCard
          title="Revenue"
          value={data.booking_revenue.toLocaleString()}
          suffix=" VND"
          icon={<FaMoneyBillWave />}
        />
      </div>

      <Card className="p-6">
        <h2 className="font-bold mb-4">Daily Booking Revenue & Orders</h2>

        <LineChart
          xAxis={[
            {
              data: data.daily_booking_stats.map((i: any) => i.date),
              scaleType: "band",
            },
          ]}
          series={[
            {
              data: data.daily_booking_stats.map((i: any) => i.revenue),
              label: "Revenue",
            },
            {
              data: data.daily_booking_stats.map((i: any) => i.total_order),
              label: "Orders",
            },
          ]}
          height={320}
        />
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center gap-4">
          <h2 className="font-bold self-start">Popular Room Types (%)</h2>

          <PieChart
            series={[
              {
                data: data.popular_room_type_stats.map(
                  (i: any, idx: number) => ({
                    id: idx,
                    value: i.count,
                    label: i.room_type_name,
                  })
                ),
                outerRadius: 130,
                innerRadius: 50,
                paddingAngle: 3,
                cx: 200,
                cy: 150,
              },
            ]}
            width={400}
            height={300}
            slotProps={{
              legend: {
                sx: {
                  display: "none",
                },
              },
            }}
          />

          <div className="grid grid-cols-1 gap-2 w-full text-sm">
            {data.popular_room_type_stats.map((i: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
              >
                <span className="font-medium">{i.room_type_name}</span>
                <span className="text-blue-600 font-semibold">
                  {i.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold mb-4">Booking Source (Quantity)</h2>

          <BarChart
            xAxis={[
              {
                data: data.booking_source_stats.map((i: any) => i.label),
                scaleType: "band",
              },
            ]}
            series={[
              {
                data: data.booking_source_stats.map((i: any) => i.value),
              },
            ]}
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h2 className="font-bold mb-4">Service Usage (Ascending)</h2>

          <BarChart
            xAxis={[
              {
                data: serviceUsageSorted.map((i: any) => i.label),
                scaleType: "band",
              },
            ]}
            series={[
              {
                data: serviceUsageSorted.map((i: any) => i.value),
              },
            ]}
            height={300}
          />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-bold mb-4">Order Service Status</h2>

          <PieChart
            series={[
              {
                data: data.order_service_stats.map((i: any, idx: number) => ({
                  id: idx,
                  label: i.status,
                  value: i.count,
                })),
              },
            ]}
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h2 className="font-bold mb-4">Request Status</h2>

          <PieChart
            series={[
              {
                data: data.request_stats.map((i: any, idx: number) => ({
                  id: idx,
                  label: i.status,
                  value: i.count,
                })),
              },
            ]}
            height={300}
          />
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix = "",
  icon,
}: {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4 hover:shadow-xl transition">
      <div className="text-blue-600 text-2xl">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-bold text-gray-800">
          {value}
          {suffix}
        </p>
      </div>
    </div>
  );
}
