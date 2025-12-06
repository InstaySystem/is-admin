/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, Space, Button, Input, Select, DatePicker, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getOrderServiceForAdmin } from "@/apis/order_service";
const { RangePicker } = DatePicker;

export default function OrderServicesPage() {
  const [loading, setLoading] = useState(false);

  const [services, setServices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string | undefined>("created_at");
  const [order, setOrder] = useState<string | undefined>("desc");

  const [dateRange, setDateRange] = useState<any>(null);

  const fetchOrderServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrderServiceForAdmin({
        page,
        limit,
        search,
        status,
        sort,
        order,
        from: dateRange?.[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
        to: dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
      });

      setServices(res.data.data.order_services || []);
      setTotal(res.data.data.meta.total);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    }
    setLoading(false);
  }, [page, limit, search, status, sort, order, dateRange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrderServices();
  }, [fetchOrderServices]);

  const columns = [
    {
      title: "Dịch vụ",
      dataIndex: "service_name",
      key: "service_name",
    },
    {
      title: "Phòng",
      dataIndex: "room_name",
      key: "room_name",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_price",
      key: "total_price",
      render: (v: number) =>
        v.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => {
        const mapTag: any = {
          accepted: { color: "green", label: "Đã chấp nhận" },
          pending: { color: "gold", label: "Đang xử lý" },
          rejected: { color: "red", label: "Từ chối" },
          cancelled: { color: "gray", label: "Đã hủy" },
        };

        const item = mapTag[v] || { color: "default", label: v };

        return (
          <span className="font-medium">
            <Tag color={item.color} className="px-3 py-1 text-base rounded-lg">
              {item.label}
            </Tag>
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={() => {
            window.location.href = `/order-services/${record.id}`;
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 text-lg">
      <div className="flex flex-wrap gap-3 justify-between items-start mb-4 text-lg">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Space.Compact className="min-w-[250px] w-[300px]">
            <Input
              placeholder="Tìm kiếm..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              className="bg-[#608DBC]!"
              onClick={() => {
                setPage(1);
                fetchOrderServices();
              }}
            />
          </Space.Compact>

          <Select
            allowClear
            placeholder="Trạng thái"
            className="min-w-[180px]"
            value={status}
            onChange={setStatus}
            options={[
              { label: "Chấp nhận", value: "accepted" },
              { label: "Đang xử lý", value: "pending" },
              { label: "Từ chối", value: "rejected" },
            ]}
          />

          <RangePicker
            className="min-w-[260px]"
            onChange={(v) => setDateRange(v)}
            format="YYYY-MM-DD"
            allowClear
          />

          <Select
            placeholder="Sắp xếp theo"
            className="min-w-[180px]"
            value={sort}
            onChange={setSort}
            options={[
              { label: "Ngày tạo", value: "created_at" },
              { label: "Tên dịch vụ", value: "service_name" },
              { label: "Giá", value: "total_price" },
            ]}
          />

          <Select
            className="min-w-[140px]"
            value={order}
            onChange={setOrder}
            options={[
              { label: "Giảm dần", value: "desc" },
              { label: "Tăng dần", value: "asc" },
            ]}
          />
        </div>

        <Button
          type="default"
          className="border-[#608DBC] text-[#608DBC]"
          onClick={() => {
            setSearch("");
            setStatus(undefined);
            setSort("created_at");
            setOrder("desc");
            setDateRange(null);
            setPage(1);
            fetchOrderServices();
          }}
        >
          Reset
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={services}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          total,
          pageSize: limit,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        className="text-lg"
      />
    </div>
  );
}
