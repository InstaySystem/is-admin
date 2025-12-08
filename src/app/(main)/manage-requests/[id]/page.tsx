/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, message, Tag } from "antd";

import { getRequestById, updateRequestForAdmin } from "@/apis/request";

export default function RequestDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getRequestById(id);
      setData(res.data.data.request);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (!data)
    return <div className="p-6 text-center">Không tìm thấy yêu cầu</div>;

  const {
    code,
    status,
    content,
    created_at,
    updated_at,
    order_room,
    request_type,
    updated_by,
  } = data;

  const statusColor: Record<string, string> = {
    pending: "gold",
    accepted: "green",
    done: "blue",
  };

  const handleUpdateStatus = async () => {
    let newStatus = "";
    if (status === "pending") newStatus = "accepted";
    else if (status === "accepted") newStatus = "done";
    else return;

    try {
      setUpdating(true);
      await updateRequestForAdmin(id, { status: newStatus });
      message.success(
        newStatus === "accepted"
          ? "Yêu cầu đã được chấp nhận"
          : "Yêu cầu đã hoàn thành"
      );
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const buttonLabel =
    status === "pending"
      ? "Chấp nhận"
      : status === "accepted"
      ? "Hoàn thành"
      : null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chi tiết yêu cầu</h1>
        <Button
          className="bg-[#608DBC]! text-white hover:text-white!"
          onClick={() => router.back()}
        >
          Quay lại
        </Button>
      </div>

      <Card className="shadow-lg border border-gray-200 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-900">
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Mã yêu cầu:</span> {code}
            </p>
            <p>
              <span className="font-semibold">Trạng thái:</span>{" "}
              <Tag
                color={statusColor[status] || "gray"}
                className="uppercase font-medium"
              >
                {status}
              </Tag>
            </p>
            <p>
              <span className="font-semibold">Ngày tạo:</span>{" "}
              {new Date(created_at).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Cập nhật:</span>{" "}
              {new Date(updated_at).toLocaleString()}
            </p>
            {updated_by?.id && (
              <p>
                <span className="font-semibold">Người cập nhật:</span>{" "}
                {updated_by.first_name} {updated_by.last_name} (
                {updated_by.username})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p>
              <span className="font-semibold">Loại yêu cầu:</span>{" "}
              {request_type?.name || "Không xác định"}
            </p>
            <p>
              <span className="font-semibold">Nội dung:</span> {content}
            </p>
          </div>

          <div className="col-span-2 pt-4 border-t border-gray-200">
            <p className="font-semibold mb-1">Phòng:</p>
            <p>
              {order_room?.room?.name} — Tầng{" "}
              {order_room?.room?.floor || "Không xác định"}
            </p>
          </div>
        </div>

        {buttonLabel && (
          <div className="flex gap-4 mt-6">
            <Button
              type="primary"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleUpdateStatus}
              loading={updating}
            >
              {buttonLabel}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
