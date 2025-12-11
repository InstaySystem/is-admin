/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table, Button, Select, DatePicker, Pagination } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getRequestsForAdmin } from "@/apis/request";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { useMessage } from "@/app/providers/MessageProvider";

const { RangePicker } = DatePicker;

export default function ManageRequestPage() {
  const isAdmin = useAppStore((s) => s._role) === "admin";
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<string | undefined>(undefined);
  const [fromTo, setFromTo] = useState<[string, string] | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const msg = useMessage();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        status: status || undefined,
        from: fromTo?.[0],
        to: fromTo?.[1],
        sort: "created_at",
        order: "desc",
      };

      const res = await getRequestsForAdmin(params);

      setRequests(res.data.data.requests || []);
      setTotal(res.data.data.meta.total || 0);
    } catch (error: any) {
      msg.error(error);
    }
    setLoading(false);
  }, [msg, page, limit, status, fromTo]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const columns = [
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        const colorMap: any = {
          pending: "orange",
          accepted: "blue",
          cancelled: "red",
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
      render: (_: any, record: any) => <span>{record.request_type}</span>,
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
      <div className="flex flex-wrap gap-3 justify-between mb-4">
        <div className="flex flex-wrap gap-3">
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
              { label: "Cancelled", value: "cancelled" },
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

        {isAdmin && (
          <div className="flex gap-3">
            <Button
              type="primary"
              className="bg-[#608DBC]!"
              onClick={() => {
                router.push("/manage-requests/request-types");
              }}
            >
              Loại yêu cầu
            </Button>
          </div>
        )}
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
