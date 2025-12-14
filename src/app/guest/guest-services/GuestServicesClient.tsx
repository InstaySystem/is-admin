"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Button, Modal, message, Spin, Input } from "antd";
import {
  getOrderServiceForGuest,
  updateOrderServiceForGuest,
} from "@/apis/order_service";
const { TextArea } = Input;
import { Suspense } from "react";

interface ServiceType {
  id: number;
  name: string;
  slug: string;
}

interface ServiceThumbnail {
  id: number;
  key: string;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  service_type: ServiceType;
  thumbnail?: ServiceThumbnail;
}

interface OrderService {
  id: number;
  code: string;
  service: Service;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  guest_note?: string | null;
  staff_note?: string | null;
  cancel_reason?: string | null;
  reject_reason?: string | null;
}

export default function GuestServicesPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<OrderService[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState<OrderService | null>(
    null
  );
  const [updating, setUpdating] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  console.log(selectedService);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await getOrderServiceForGuest();
        setServices(res.data.data.order_services || []);
      } catch (error) {
        message.error("Không thể tải danh sách dịch vụ");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const serviceId = searchParams.get("serviceId");
    if (serviceId && services.length > 0) {
      const service = services.find((s) => s.id === parseInt(serviceId));
      if (service) {
        setSelectedService(service);
      }
    }
  }, [services, searchParams]);

  const handleCancelService = async () => {
    if (!selectedService || !cancelReason.trim()) {
      return message.warning("Vui lòng nhập lý do hủy!");
    }

    try {
      setUpdating(true);
      await updateOrderServiceForGuest(selectedService.id, {
        status: "cancelled",
        reason: cancelReason,
      });
      message.success("Hủy dịch vụ thành công");

      setServices((prev) =>
        prev.map((s) =>
          s.id === selectedService.id
            ? { ...s, status: "cancelled", cancel_reason: cancelReason }
            : s
        )
      );
      setSelectedService(null);
      setCancelReason("");
      setCancelModalOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Hủy dịch vụ thất bại");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin tip="Đang tải..." />
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl text-center font-semibold mb-4 text-black">
          Danh sách dịch vụ đã đặt
        </h1>

        {services.length === 0 && (
          <div className="text-center text-gray-500">Không có dịch vụ nào</div>
        )}

        <div className="space-y-3">
          {services.map((service) => (
            <Card
              key={service.id}
              hoverable
              className="cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{service.service.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {service.guest_note || service.service.service_type.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Số lượng: {service.quantity} | Tổng:
                    {service.total_price.toFixed(2)}₫
                  </div>
                </div>
                <div
                  className={`text-sm font-medium ${
                    service.status === "accepted"
                      ? "text-blue-500"
                      : service.status === "cancelled"
                      ? "text-gray-400"
                      : service.status === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  {service.status}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Modal
          title={`Dịch vụ ${selectedService?.service.name}`}
          open={!!selectedService}
          onCancel={() => setSelectedService(null)}
          footer={
            selectedService?.status === "pending" ? (
              <Button danger onClick={() => setCancelModalOpen(true)}>
                Hủy
              </Button>
            ) : null
          }
        >
          {selectedService && (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Tên dịch vụ:</span>{" "}
                {selectedService.service.name}
              </p>
              <p>
                <span className="font-medium">Loại dịch vụ:</span>{" "}
                {selectedService.service.service_type.name}
              </p>
              <p>
                <span className="font-medium">Số lượng:</span>{" "}
                {selectedService.quantity}
              </p>
              <p>
                <span className="font-medium">Tổng giá:</span>
                {selectedService.total_price.toFixed(2)}₫
              </p>
              <p>
                <span className="font-medium">Nội dung của khách:</span>{" "}
                {selectedService.guest_note || "-"}
              </p>
              <p>
                <span className="font-medium">Nội dung nhân viên:</span>{" "}
                {selectedService.staff_note || "-"}
              </p>
              {selectedService.cancel_reason && (
                <p>
                  <span className="font-medium">Lý do hủy:</span>{" "}
                  {selectedService.cancel_reason}
                </p>
              )}
              {selectedService.reject_reason && (
                <p>
                  <span className="font-medium">Lý do từ chối:</span>{" "}
                  {selectedService.reject_reason}
                </p>
              )}
              <p>
                <span className="font-medium">Trạng thái:</span>{" "}
                {selectedService.status}
              </p>
              <p>
                <span className="font-medium">Ngày tạo:</span>{" "}
                {new Date(selectedService.created_at).toLocaleString("vi-VN")}
              </p>
            </div>
          )}
        </Modal>

        <Modal
          title="Lý do hủy dịch vụ"
          open={cancelModalOpen}
          onCancel={() => setCancelModalOpen(false)}
          okText="Hủy dịch vụ"
          okButtonProps={{ danger: true, loading: updating }}
          onOk={handleCancelService}
        >
          <TextArea
            rows={4}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Nhập lý do hủy dịch vụ..."
          />
        </Modal>
      </div>
    </Suspense>
  );
}
