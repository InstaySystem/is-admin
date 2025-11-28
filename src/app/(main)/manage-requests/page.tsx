/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Pagination,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { getRequestsForAdmin } from "@/apis/request";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const { RangePicker } = DatePicker;

export default function ManageRequestPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [fromTo, setFromTo] = useState<[string, string] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        from: fromTo?.[0],
        to: fromTo?.[1],
        sort: "created_at",
        order: "desc",
      };

      const res = await getRequestsForAdmin(params);

      setRequests(res.data.data.requests || []);
      setTotal(res.data.data.meta.total || 0);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
    setLoading(false);
  }, [page, limit, search, status, fromTo]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        const colorMap: any = {
          pending: "orange",
          accepted: "blue",
          canceled: "red",
          done: "green",
        };
        return (
          <span style={{ color: colorMap[s] || "black", fontWeight: 600 }}>
            {s}
          </span>
        );
      },
    },
    {
      title: "Loại yêu cầu",
      key: "request_type",
      render: (_: any, record: any) => (
        <span>{record.request_type?.name || "-"}</span>
      ),
    },
    {
      title: "Phòng",
      key: "order_room",
      render: (_: any, record: any) => (
        <span>{record.order_room?.room_number || "-"}</span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={() => {
            window.location.href = `/manage-requests/${record.id}`;
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div className="flex flex-wrap gap-3 justify-between items-start mb-4">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Input.Search
            placeholder="Tìm kiếm nội dung hoặc code..."
            allowClear
            value={search}
            className="min-w-[200px] w-[250px]"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Button
            type="primary"
            className="bg-[#608DBC]!"
            onClick={() => {
              router.push("/manage-requests/request-types");
            }}
          >
            Loại yêu cầu
          </Button>

          <Button type="primary" className="bg-[#608DBC]!" onClick={() => {}}>
            Tạo yêu cầu
          </Button>

          <Select
            placeholder="Trạng thái"
            allowClear
            className="w-[150px]"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={[
              { label: "Pending", value: "pending" },
              { label: "Accepted", value: "accepted" },
              { label: "Canceled", value: "canceled" },
              { label: "Done", value: "done" },
            ]}
          />

          <RangePicker
            allowClear
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
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={requests}
        loading={loading}
        rowKey="id"
        pagination={false}
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
    </div>
  );
}
