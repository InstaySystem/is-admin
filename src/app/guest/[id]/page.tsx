"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, InputNumber, Select, Form, Button, Modal } from "antd";
import { useParams, useRouter } from "next/navigation";
import CustomAlert from "@/components/ui/CustomAlert";
import ImagesUploader from "@/app/(main)/manage-services/components/ImagesUploader";
import { getServicesBySlug } from "@/apis/services";
import { generateViewPresignedUrls } from "@/apis/file";
import { ServiceType } from "@/types/service";
import { createOrderService } from "@/apis/order_room";

interface FormValues {
  name: string;
  price: number;
  slug?: string;
  is_active: boolean;
  service_type_id?: number;
  images: any[];
}

interface OrderServiceFormValues {
  quantity: number;
  guest_note: string;
}

export default function DetailGuestServicePage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
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
  const serviceSlug = params.id;
  const router = useRouter();

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const { control, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      name: "",
      price: 0,
      is_active: true,
      service_type_id: undefined,
      images: [],
    },
  });

  const { control: orderControl, handleSubmit: handleOrderSubmit } =
    useForm<OrderServiceFormValues>({
      defaultValues: { quantity: 1, guest_note: "" },
    });

  useEffect(() => {
    (async () => {
      try {
        const res = await getServicesBySlug(serviceSlug);
        const service = res.data.data.service;

        reset({
          name: service.name,
          price: service.price,
          is_active: service.is_active,
          service_type_id: service.service_type?.id,
        });

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

          setFileList(mapped);
          setValue("images", mapped);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [serviceSlug, reset, setValue]);

  const handlePlaceOrder = () => {
    setIsModalOpen(true);
  };

  const onOrderSubmit = async (data: OrderServiceFormValues) => {
    if (!originalData) return;
    setModalLoading(true);
    try {
      const res = await createOrderService({
        service_id: originalData.id,
        quantity: data.quantity,
        guest_note: data.guest_note,
      });
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

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Chi tiết dịch vụ
      </h2>
      <Form layout="vertical" disabled={loading}>
        <div className="grid grid-cols-2 gap-6">
          <Form.Item label="Tên dịch vụ">
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} disabled />}
            />
          </Form.Item>

          <Form.Item label="Giá dịch vụ">
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} disabled className="w-full" />
              )}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <Form.Item label="Loại dịch vụ">
            <Controller
              name="service_type_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  disabled
                  placeholder="Chọn loại dịch vụ"
                  options={serviceTypes.map((st) => ({
                    label: st.name,
                    value: st.id,
                  }))}
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item label="Hình ảnh dịch vụ" className="mt-6">
          <Controller
            name="images"
            control={control}
            render={() => (
              <ImagesUploader
                fileList={fileList}
                setFileList={setFileList}
                setValue={setValue}
                handlePreview={() => {}}
                disabled
              />
            )}
          />
        </Form.Item>

        <Button type="primary" className="mt-6" onClick={handlePlaceOrder}>
          Đặt dịch vụ
        </Button>
      </Form>

      {/* Modal đặt dịch vụ */}
      <Modal
        open={isModalOpen}
        title="Đặt dịch vụ"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOrderSubmit(onOrderSubmit)}
        confirmLoading={modalLoading}
      >
        <Form layout="vertical">
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
                <Input.TextArea {...field} placeholder="Nhập ghi chú..." />
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
