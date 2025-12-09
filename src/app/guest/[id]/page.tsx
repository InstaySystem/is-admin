"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputNumber, Form, Button, Modal, Input } from "antd";
import { useParams, useRouter } from "next/navigation";
import CustomAlert from "@/components/ui/CustomAlert";
import { getServicesBySlug } from "@/apis/services";
import { generateViewPresignedUrls } from "@/apis/file";
import { createOrderService } from "@/apis/order_room";

interface OrderServiceFormValues {
  quantity: number;
  guest_note: string;
}

export default function DetailGuestServicePage() {
  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });
  const [fileList, setFileList] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const params = useParams();
  const serviceSlug = params.id?.toString();
  const router = useRouter();

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const { control: orderControl, handleSubmit: handleOrderSubmit } =
    useForm<OrderServiceFormValues>({
      defaultValues: { quantity: 1, guest_note: "" },
    });

  useEffect(() => {
    (async () => {
      try {
        const res = await getServicesBySlug(serviceSlug);
        const service = res.data.data.service;
        setOriginalData(service);

        if (service.images?.length) {
          const keys = service.images.map((img: any) => img.key);
          const urlsRes = await generateViewPresignedUrls({ keys });
          const presignedUrls = urlsRes.data.data.presigned_url;

          const mapped = service.images.map((img: any, index: number) => ({
            uid: `old-${img.id}`,
            id: img.id,
            key: img.key,
            name: img.name || img.key,
            url: presignedUrls[index]?.url || img.url || "",
            preview: presignedUrls[index]?.url || img.url || "",
            is_thumbnail: img.is_thumbnail,
            sort_order: img.sort_order,
          }));

          const sorted = mapped.sort(
            (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
          );

          setFileList(sorted);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [serviceSlug]);

  const handlePlaceOrder = () => {
    setIsModalOpen(true);
  };

  const onOrderSubmit = async (data: OrderServiceFormValues) => {
    if (!originalData) return;
    setModalLoading(true);

    const payload: any = {
      service_id: originalData.id,
      quantity: data.quantity,
    };

    if (data.guest_note && data.guest_note.trim() !== "") {
      payload.guest_note = data.guest_note.trim();
    }

    try {
      const res = await createOrderService(payload);
      showAlert("success", res.data.message || "Đặt dịch vụ thành công");
      setIsModalOpen(false);
      const id = res.data.data.id;
      router.push(`/guest/guest-services?serviceId=${id}`);
    } catch (err: any) {
      console.error(err);
      showAlert("error", err.message);
    } finally {
      setModalLoading(false);
    }
  };

  if (!originalData) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 mt-6">
        <p className="text-center text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Chi tiết dịch vụ
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tên dịch vụ
          </label>
          <p className="text-lg text-gray-900">{originalData.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giá dịch vụ
            </label>
            <p className="text-lg text-gray-900 font-medium">
              {originalData.price?.toLocaleString("vi-VN")} VNĐ
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Loại dịch vụ
            </label>
            <p className="text-lg text-gray-900">
              {originalData.service_type?.name || "Chưa phân loại"}
            </p>
          </div>
        </div>

        {fileList.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Hình ảnh dịch vụ
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:grid-cols-5">
              {fileList.map((file) => (
                <div
                  key={file.uid}
                  className="relative w-36 aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <img
                    src={file.url || file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    width={50}
                    height={50}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Button
            type="primary"
            onClick={handlePlaceOrder}
            className="w-full md:w-auto"
          >
            Đặt dịch vụ
          </Button>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        title="Đặt dịch vụ"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOrderSubmit(onOrderSubmit)}
        confirmLoading={modalLoading}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Số lượng">
            <Controller
              name="quantity"
              control={orderControl}
              render={({ field }) => (
                <InputNumber {...field} min={1} className="w-full" />
              )}
            />
          </Form.Item>

          <Form.Item label="Ghi chú của khách">
            <Controller
              name="guest_note"
              control={orderControl}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  placeholder="Nhập ghi chú (nếu có)..."
                  rows={4}
                />
              )}
            />
          </Form.Item>
        </Form>
      </Modal>

      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
      />
    </div>
  );
}
