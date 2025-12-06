/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  Space,
  Input,
  DatePicker,
  Pagination,
  Rate,
  Select,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { Review } from "@/types/reviews";
import CustomAlert from "@/components/ui/CustomAlert";
import dayjs from "dayjs";
import { getAllReviewsAdmin } from "@/apis/reviews";

const { RangePicker } = DatePicker;

export default function ManageReviews() {
  const [reviews, setReviews] = useState<Review[]>();
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [fromTo, setFromTo] = useState<[string, string] | null>(null);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"created_at">("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const query: any = {
        page,
        limit,
        sort: sortBy,
        order,
      };

      // Thêm filter nếu có
      if (search || starFilter) {
        const filters = [];
        if (search) filters.push(`email:${search}`);
        if (starFilter) filters.push(`star:${starFilter}`);
        query.filter = filters.join(",");
      }

      // Thêm date range nếu có
      if (fromTo?.[0]) query.from = fromTo[0];
      if (fromTo?.[1]) query.to = fromTo[1];

      const res = await getAllReviewsAdmin(query);
      setReviews(res.data.data.reviews || []);
      setTotal(res.data.data.meta.total || 0);
    } catch (err: any) {
      showAlert("error", err.message || "Lỗi tải danh sách review");
    }
    setLoading(false);
  }, [page, limit, search, fromTo, starFilter, sortBy, order]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => (
        <span className="font-medium text-blue-600">{text}</span>
      ),
      width: 180,
    },
    {
      title: "Đánh Giá",
      dataIndex: "star",
      key: "star",
      render: (star: number) => (
        <Rate disabled value={star} style={{ color: "#faad14" }} />
      ),
      width: 250,
    },
    {
      title: "Nội Dung",
      dataIndex: "content",
      key: "content",
      render: (text: string) => (
        <span className="text-gray-700 line-clamp-2 max-w-xs">{text}</span>
      ),
      ellipsis: true,
    },
    {
      title: "Ngày Tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span className="text-sm text-gray-600">
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
      width: 160,
      sorter: (a: Review, b: Review) =>
        dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-bold mb-6">Quản Lý Reviews</h1>

      <div className="flex flex-wrap gap-3 justify-between items-start mb-4">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Space.Compact className="min-w-[200px] w-[250px]">
            <Input.Search
              placeholder="Tìm kiếm email..."
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Space.Compact>

          <Select
            placeholder="Lọc theo sao"
            allowClear
            style={{ width: 150 }}
            value={starFilter}
            onChange={(value) => {
              setStarFilter(value);
              setPage(1);
            }}
            options={[
              { label: "⭐ 5 sao", value: 5 },
              { label: "⭐ 4 sao", value: 4 },
              { label: "⭐ 3 sao", value: 3 },
              { label: "⭐ 2 sao", value: 2 },
              { label: "⭐ 1 sao", value: 1 },
            ]}
          />

          <RangePicker
            allowClear
            format="DD/MM/YYYY"
            onChange={(dates) => {
              setFromTo(
                dates && dates[0] && dates[1]
                  ? [
                      dates[0].format("YYYY-MM-DD"),
                      dates[1].format("YYYY-MM-DD"),
                    ]
                  : null
              );
              setPage(1);
            }}
          />

          <Select
            placeholder="Sắp xếp"
            style={{ width: 180 }}
            value={order}
            onChange={(value) => {
              setOrder(value);
              setPage(1);
            }}
            options={[
              { label: "Mới nhất", value: "desc" },
              { label: "Cũ nhất", value: "asc" },
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={reviews}
        loading={loading}
        rowKey="id"
        pagination={false}
        className="bg-white rounded-lg shadow-sm"
      />

      <div className="flex justify-end mt-4">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
        />
      </div>

      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
      />
    </div>
  );
}
