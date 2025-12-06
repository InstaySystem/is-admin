/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  Space,
  Button,
  Input,
  DatePicker,
  Pagination,
  Select,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { getBookings } from "@/apis/booking";
import { Booking } from "@/types/booking";
import CustomAlert from "@/components/ui/CustomAlert";
import CommonModal from "@/components/modals/CommonModal";
import { getSources } from "@/apis/source";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const { RangePicker } = DatePicker;

export default function ManageBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [fromTo, setFromTo] = useState<[string, string] | null>(null);

  const [sources, setSources] = useState<any[]>([]);
  const [sourceId, setSourceId] = useState<string | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const router = useRouter();

  const fetchSources = useCallback(async () => {
    try {
      const res = await getSources();
      setSources(res.data.data.sources || []);
    } catch (err: any) {
      showAlert("error", err.message || "Lỗi tải danh sách nguồn booking");
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const query: any = {
        page,
        limit,
        search: search || undefined,
        source_id: sourceId || undefined,
        filter: undefined,
        from: fromTo?.[0],
        to: fromTo?.[1],
        sort: "booked_on",
        order: "desc",
      };

      const res = await getBookings(query);
      setBookings(res.data.data.bookings || []);
      setTotal(res.data.data.meta.total || 0);
    } catch (err: any) {
      showAlert("error", err.message || "Lỗi tải danh sách booking");
    }
    setLoading(false);
  }, [page, limit, search, fromTo, sourceId]);

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleOpenDeleteModal = (id: number) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleBookingDetail = (id: number) => {
    router.push(`/manage-booking/${id}`);
  };

  const handleDelete = async () => {
    if (!idToDelete) return;
    showAlert("success", `Xóa booking ${idToDelete} thành công`);
    setIsDeleteModalOpen(false);
    setIdToDelete(null);
    fetchBookings();
  };

  const columns = [
    {
      title: "Booking Number",
      dataIndex: "booking_number",
      key: "booking_number",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Guest Name",
      dataIndex: "guest_name",
      key: "guest_name",
    },
    {
      title: "Check In / Check Out",
      key: "dates",
      render: (_: any, record: Booking) => (
        <span>
          {dayjs(record.check_in).format("YY/MM/DD HH:mm")} -{" "}
          {dayjs(record.check_out).format("YY/MM/DD HH:mm")}
        </span>
      ),
    },
    {
      title: "Booked On",
      dataIndex: "booked_on",
      key: "booked_on",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Actions",
      key: "action",
      render: (_: any, record: Booking) => (
        <Space>
          <Button
            size="small"
            type="primary"
            className="bg-[#608DBC]!"
            onClick={() => handleBookingDetail(record.id)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleOpenDeleteModal(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div className="flex flex-wrap gap-3 justify-between items-start mb-4">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Space.Compact className="min-w-[200px] w-[250px]">
            <Input.Search
              placeholder="Tìm kiếm guest..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Space.Compact>

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

          <Select
            allowClear
            placeholder="Nguồn booking"
            className="min-w-[180px]"
            value={sourceId}
            onChange={(value) => {
              setSourceId(value);
              setPage(1);
            }}
            options={sources.map((s) => ({
              label: s.name,
              value: s.id,
            }))}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={bookings}
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

      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
      />

      <CommonModal
        open={isDeleteModalOpen}
        title="Xác nhận xóa booking"
        onClose={() => setIsDeleteModalOpen(false)}
        onOk={handleDelete}
      />
    </div>
  );
}
