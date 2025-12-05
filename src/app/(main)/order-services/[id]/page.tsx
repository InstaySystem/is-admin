/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Button, Modal, message, Tag } from "antd";

import {
  getOrderServiceById,
  updateOrderServiceForAdmin,
} from "@/apis/order_service";
import TextArea from "antd/es/input/TextArea";

export default function OrderServiceDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalType, setModalType] = useState<"accepted" | "rejected" | null>(
    null
  );
  const [reason, setReason] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getOrderServiceById(id);
      setData(res.data.data.order_service);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu đơn dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (!data)
    return <div className="p-6 text-center">Không tìm thấy đơn dịch vụ</div>;

  const {
    code,
    status,
    guest_note,
    staff_note,
    total_price,
    created_at,
    updated_at,
    quantity,
    order_room,
    service,
  } = data;

  const statusColor = {
    pending: "gold",
    accepted: "green",
    rejected: "red",
    cancelled: "gray",
  }[status as string];

  const handleConfirm = async () => {
    if (!modalType) return;

    try {
      const payload: any = {
        status: modalType,
      };

      if (modalType === "rejected") payload.reason = reason || "Không có lý do";
      if (modalType === "accepted") payload.staff_note = reason || null;

      await updateOrderServiceForAdmin(id, payload);

      message.success(
        modalType === "accepted"
          ? "Đã chấp nhận đơn dịch vụ"
          : "Đã từ chối đơn dịch vụ"
      );

      setModalType(null);
      setReason("");

      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Chi tiết đơn dịch vụ
        </h1>
        <Button
          className="bg-[#608DBC]! text-white hover:text-white!"
          onClick={() => history.back()}
        >
          Quay lại
        </Button>
      </div>

      <Card className="shadow-lg border border-gray-200 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-900">
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Mã đơn:</span> {code}
            </p>
            <p>
              <span className="font-semibold">Trạng thái:</span>{" "}
              <Tag color={statusColor} className="uppercase font-medium">
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
            <p>
              <span className="font-semibold">Số lượng:</span> {quantity}
            </p>
          </div>

          <div className="space-y-2">
            <p>
              <span className="font-semibold">Dịch vụ:</span> {service?.name}
            </p>
            <p>
              <span className="font-semibold">Loại dịch vụ:</span>{" "}
              {service?.service_type?.name || "Không có"}
            </p>
            <p>
              <span className="font-semibold">Giá:</span>{" "}
              {service?.price.toLocaleString()}đ
            </p>
            <p>
              <span className="font-semibold">Tổng tiền:</span>{" "}
              {total_price.toLocaleString()}đ
            </p>
          </div>

          <div className="col-span-2 pt-4 border-t border-gray-200">
            <p className="font-semibold mb-1">Phòng:</p>
            <p>
              {order_room?.room?.name} — Tầng{" "}
              {order_room?.room?.floor?.name || "Không xác định"}
            </p>
          </div>

          <div className="col-span-2">
            <p className="font-semibold mb-1">Ghi chú khách:</p>
            <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
              {guest_note || "Không có"}
            </div>
          </div>

          <div className="col-span-2">
            <p className="font-semibold mb-1">Ghi chú nhân viên:</p>
            <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
              {staff_note || "Không có"}
            </div>
          </div>
        </div>

        {status === "pending" && (
          <div className="flex gap-4 mt-6">
            <Button
              type="primary"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setModalType("accepted")}
            >
              Chấp nhận
            </Button>
            <Button
              danger
              type="default"
              onClick={() => setModalType("rejected")}
            >
              Từ chối
            </Button>
          </div>
        )}
      </Card>

      <Modal
        title={
          modalType === "accepted"
            ? "Chấp nhận đơn dịch vụ"
            : "Từ chối đơn dịch vụ"
        }
        open={!!modalType}
        onCancel={() => setModalType(null)}
        onOk={handleConfirm}
        okText={modalType === "accepted" ? "Chấp nhận" : "Từ chối"}
        okButtonProps={{
          className:
            modalType === "accepted"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-red-600 hover:bg-red-700",
        }}
      >
        <p className="text-gray-800 mb-2">
          {modalType === "accepted"
            ? "Bạn có muốn chấp nhận đơn dịch vụ này?"
            : "Hãy nhập lý do từ chối (không bắt buộc):"}
        </p>

        <TextArea
          className="w-full mt-2 border border-gray-300 rounded-md p-2 resize-none"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            modalType === "accepted"
              ? "Ghi chú nhân viên (tùy chọn)..."
              : "Lý do từ chối..."
          }
        />
      </Modal>
    </div>
  );
}
