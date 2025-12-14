/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Pie, Chart } from "react-chartjs-2";
import { getDashboardData } from "@/apis/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = {
  primary: "#608dbc",
  secondary: "#b0cbe8",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#06B6D4",
  purple: "#A855F7",
  pink: "#EC4899",
  gradients: [
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#06B6D4",
    "#A855F7",
    "#EF4444",
  ],
};

interface DashboardData {
  total_staff: number;
  total_rooms: number;
  occupied_rooms: number;
  total_services: number;
  total_bookings: number;
  booking_revenue: number;
  average_review_rating: number;
  booking_source_stats: Array<{
    label: string;
    value: number;
    percentage: number;
  }>;
  service_usage_stats: Array<{
    label: string;
    value: number;
    percentage: number;
  }>;
  popular_room_type_stats: Array<{
    room_type_name: string;
    count: number;
    percentage: number;
  }>;
  revenue_source_stats: Array<{
    label: string;
    value: number;
    percentage: number;
  }>;
  order_service_stats: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  request_stats: Array<{ status: string; count: number; percentage: number }>;
  daily_booking_stats: Array<{
    date: string;
    booking_count: number;
    revenue: number;
  }>;
}

export default function DashBoardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDashboardData();
        const payload = res?.data?.data?.dashboard;

        if (!payload) {
          throw new Error("Dashboard data not found in API response");
        }

        setData(payload as DashboardData);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-red-500 font-medium">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  const revenueLineData = {
    labels: data.daily_booking_stats.map((stat) => {
      const date = new Date(stat.date);
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        type: "line" as const,
        label: "Revenue (₫)",
        data: data.daily_booking_stats.map((stat) => stat.revenue),
        borderColor: "#6a7282",
        backgroundColor: "#6a7282",
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y",
        order: 1,
      },
      {
        type: "bar" as const,
        label: "Bookings",
        data: data.daily_booking_stats.map((stat) => stat.booking_count),
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.5,
        yAxisID: "y1",
        order: 2,
      },
    ],
  };

  const revenueSourceData = {
    labels: data.revenue_source_stats.map((stat) => stat.label),
    datasets: [
      {
        data: data.revenue_source_stats.map((stat) => stat.value),
        backgroundColor: [
          COLORS.primary,
          COLORS.secondary,
          COLORS.info,
          COLORS.pink,
          COLORS.purple,
        ],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  const roomTypeData = {
    labels: data.popular_room_type_stats.map((stat) => stat.room_type_name),
    datasets: [
      {
        data: data.popular_room_type_stats.map((stat) => stat.percentage),
        backgroundColor: [
          COLORS.primary,
          COLORS.secondary,
          COLORS.info,
          COLORS.pink,
          COLORS.purple,
        ],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  const serviceUsageData = {
    labels: data.service_usage_stats.map((stat) => stat.label),
    datasets: [
      {
        label: "Usage Count",
        data: data.service_usage_stats.map((stat) => stat.value),
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const bookingSourceData = {
    labels: data.booking_source_stats.map((stat) => stat.label),
    datasets: [
      {
        label: "Bookings",
        data: data.booking_source_stats.map((stat) => stat.value),
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const orderServiceData = {
    labels: data.order_service_stats.map((stat) => stat.status),
    datasets: [
      {
        data: data.order_service_stats.map((stat) => stat.count),
        backgroundColor: [COLORS.danger, COLORS.warning, COLORS.info, COLORS.success],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const requestData = {
    labels: data.request_stats.map((stat) => stat.status),
    datasets: [
      {
        data: data.request_stats.map((stat) => stat.count),
        backgroundColor: [COLORS.danger, COLORS.warning, COLORS.success, COLORS.info],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: "normal" as const },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: "bold" as const },
        bodyFont: { size: 12 },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Rooms"
            value={`${data.occupied_rooms}/${data.total_rooms}`}
          />
          <StatCard title="Staff Members" value={data.total_staff} />
          <StatCard title="Services" value={data.total_services} />
          <StatCard title="Bookings" value={data.total_bookings} />
          <StatCard
            title="Avg Rating"
            value={data.average_review_rating.toFixed(2)}
            suffix="/5"
          />
          <StatCard
            title="Total Revenue"
            value={(data.booking_revenue / 1000000).toFixed(2)}
            suffix="M₫"
          />
        </div>

        <div className="bg-white border-l-4 border-b-4 border-l-[#b0cbe8] border-b-[#b0cbe8] rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Revenue & Booking Trends
          </h2>
          <div className="h-96">
            <Chart
              type="bar"
              data={revenueLineData}
              options={{
                ...chartOptions,
                interaction: {
                  mode: "index" as const,
                  intersect: false,
                },
                scales: {
                  y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    title: {
                      display: true,
                      text: "Revenue (₫)",
                    },
                    ticks: {
                      callback: (value) =>
                        `${(Number(value) / 1000).toFixed(0)}K`,
                    },
                  },
                  y1: {
                    type: "linear",
                    display: true,
                    position: "right",
                    grid: { drawOnChartArea: false },
                    title: {
                      display: true,
                      text: "Bookings",
                    },
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-l-4 border-b-4 border-l-[#b0cbe8] border-b-[#b0cbe8] rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Revenue by Source
            </h2>
            <div className="h-80">
              <Doughnut
                data={revenueSourceData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: "bottom",
                    },
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: (context) => {
                          const value = context.parsed;
                          const percentage =
                            data.revenue_source_stats[context.dataIndex]
                              .percentage;
                          return `${context.label}: ${(value / 1000000).toFixed(
                            2
                          )}M₫ (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white border-l-4 border-b-4 border-l-[#b0cbe8] border-b-[#b0cbe8] rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Popular Room Types
            </h2>
            <div className="h-80">
              <Doughnut
                data={roomTypeData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: "bottom",
                    },
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: (context) =>
                          `${context.label}: ${context.parsed}%`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-l-4 border-b-4 border-l-[#b0cbe8] border-b-[#b0cbe8] rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Booking Sources
            </h2>
            <div className="h-80">
              <Bar
                data={bookingSourceData}
                options={{
                  ...chartOptions,
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white border-l-4 border-b-4 border-l-[#b0cbe8] border-b-[#b0cbe8] rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Service Usage Statistics
            </h2>
            <div className="h-80">
              <Bar
                data={serviceUsageData}
                options={{
                  ...chartOptions,
                  indexAxis: "y",
                  scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-l-4 border-b-4 border-l-[#b0cbe8] border-b-[#b0cbe8] rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Service Order Status
            </h2>
            <div className="h-72">
              <Pie
                data={orderServiceData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: "bottom",
                    },
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: (context) => {
                          const percentage =
                            data.order_service_stats[context.dataIndex]
                              .percentage;
                          return `${context.label}: ${
                            context.parsed
                          } (${percentage.toFixed(1)}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white border-l-4 border-b-4 border-l-[#b0cbe8] border-b-[#b0cbe8] rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Request Status
            </h2>
            <div className="h-72">
              <Pie
                data={requestData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: "bottom",
                    },
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: (context) => {
                          const percentage =
                            data.request_stats[context.dataIndex].percentage;
                          return `${context.label}: ${
                            context.parsed
                          } (${percentage.toFixed(1)}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <div className="text-sm text-slate-500">
            Last updated: {new Date().toLocaleString("vi-VN")}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix = "",
}: {
  title: string;
  value: number | string;
  suffix?: string;
}) {
  return (
    <div className="bg-white border-l-4 border-b-4 border-l-[#b0cbe8] border-b-[#b0cbe8] rounded-2xl shadow-lg py-2 px-4 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="">
        <div className="flex-1">
          <p className="text-xl text-center font-bold text-slate-800 mt-1 border-b border-gray-300">
            {title}
          </p>
        </div>
        <div className="flex p-2 rounded-xl text-3xl font-bold text-[#608dbc] items-center justify-center">
          {value}
          {suffix}
        </div>
      </div>
    </div>
  );
}
