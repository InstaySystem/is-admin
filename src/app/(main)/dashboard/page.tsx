/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, ReactNode } from "react";
import { getDashboardData } from "@/apis/dashboard";
import { PieChart, LineChart, BarChart } from "@mui/x-charts";
import { Card } from "@mui/material";

import {
  FaBed,
  FaConciergeBell,
  FaClipboardList,
  FaMoneyBillWave,
  FaChartLine,
  FaChartPie,
  FaDoorOpen,
  FaTools,
} from "react-icons/fa";

import {
  AppstoreOutlined,
  TeamOutlined,
  StarOutlined,
} from "@ant-design/icons";

export default function DashBoardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getDashboardData();
      setData(res?.data.data?.dashboard);
    };

    fetchData();
  }, []);

  if (!data) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Rooms"
          value={data.total_rooms}
          icon={<FaBed />}
        />
        <StatCard
          title="Total Staff"
          value={data.total_staff}
          icon={<TeamOutlined />}
        />
        <StatCard
          title="Total Services"
          value={data.total_services}
          icon={<FaConciergeBell />}
        />
        <StatCard
          title="Total Bookings"
          value={data.total_bookings}
          icon={<FaClipboardList />}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Booking Revenue"
          value={data.booking_revenue.toLocaleString()}
          suffix=" VND"
          icon={<FaMoneyBillWave />}
        />
        <StatCard
          title="Average Review Rating"
          value={data.average_review_rating}
          suffix=" ⭐"
          icon={<StarOutlined />}
        />
      </div>

      <Card className="p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-600" />
          Daily Booking Revenue
        </h2>

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
            },
          ]}
          height={300}
        />
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <FaChartPie className="text-green-600" />
            Revenue By Platform
          </h2>

          <PieChart
            series={[
              {
                data: data.revenue_source_stats.map((i: any, idx: number) => ({
                  id: idx,
                  value: i.value,
                  label: i.label,
                })),
              },
            ]}
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <AppstoreOutlined className="text-purple-600" />
            Booking Source Distribution
          </h2>

          <PieChart
            series={[
              {
                data: data.booking_source_stats.map((i: any, idx: number) => ({
                  id: idx,
                  value: i.value,
                  label: i.label,
                })),
              },
            ]}
            height={300}
          />
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <FaDoorOpen className="text-orange-600" />
          Popular Room Types
        </h2>

        <BarChart
          xAxis={[
            {
              data: data.popular_room_type_stats.map(
                (i: any) => i.room_type_name
              ),
              scaleType: "band",
            },
          ]}
          series={[
            {
              data: data.popular_room_type_stats.map((i: any) => i.count),
            },
          ]}
          height={300}
        />
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <FaClipboardList className="text-indigo-600" />
            Order Service Status
          </h2>

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
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <FaTools className="text-red-600" />
            Request Status
          </h2>

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

      <Card className="p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <FaTools className="text-teal-600" />
          Service Usage
        </h2>

        <BarChart
          xAxis={[
            {
              data: data.service_usage_stats.map((i: any) => i.label),
              scaleType: "band",
            },
          ]}
          series={[
            {
              data: data.service_usage_stats.map((i: any) => i.value),
            },
          ]}
          height={300}
        />
      </Card>
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
  icon: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-xl transition relative overflow-hidden">
      <div className="absolute top-4 right-4 text-3xl text-gray-200">
        {icon}
      </div>

      <span className="text-gray-500 text-sm">{title}</span>
      <span className="text-2xl font-bold text-blue-600">
        {value}
        {suffix}
      </span>
    </div>
  );
}
