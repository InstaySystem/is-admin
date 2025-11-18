/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import {
  Input,
  Button,
  Select,
  InputNumber,
  Upload,
  Form,
  Modal,
  Image,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import { getServiceTypes, createService } from "@/apis/services";
import CustomAlert from "@/components/ui/CustomAlert";
import { ServiceType } from "@/types/service";
import { generateUploadPresignedUrls } from "@/apis/file";
import { getBase64 } from "@/utils/image";

const { Dragger } = Upload;

interface FormValues {
  name: string;
  price: number;
  slug?: string;
  is_active: boolean;
  service_type_id?: number;
  images: RcFile[];
}

export default function CreateServicePage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || file.preview || "");
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url?.substring(file.url.lastIndexOf("/") + 1) || ""
    );
  };

  const handleCancel = () => setPreviewOpen(false);

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      price: 0,
      is_active: true,
      service_type_id: undefined,
      images: [],
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getServiceTypes();
        setServiceTypes(res.data.data.service_types || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const nameValue = useWatch({ control, name: "name" });
  useEffect(() => {
    const slug = nameValue
      ?.toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setValue("slug" as any, slug);
  }, [nameValue, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (!data.service_type_id) {
      showAlert("error", "Vui lòng chọn loại dịch vụ");
      return;
    }

    if (!data.images || data.images.length === 0) {
      showAlert("error", "Vui lòng thêm ít nhất một hình ảnh cho dịch vụ");
      return;
    }

    setLoading(true);
    try {
      const presignedPayload = {
        files: data.images.map((file: RcFile) => ({
          file_name: file.name,
          content_type: file.type,
        })),
      };

      const presignedRes = await generateUploadPresignedUrls(presignedPayload);
      const presignedFiles = presignedRes.data.data.presigned_urls;

      const payload = {
        name: data.name,
        price: data.price,
        is_active: data.is_active,
        service_type_id: data.service_type_id,
        images: presignedFiles.map((ps: any, index: number) => ({
          key: ps.key,
          is_thumbnail: index === 0,
          sort_order: index + 1,
        })),
      };

      const uploadPromises = presignedFiles.map((ps: any, index: number) => {
        const file = data.images[index];
        return fetch(ps.url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });
      });

      const createPromise = Promise.all(uploadPromises).then(() => {
        return createService(payload);
      });

      const [_, res] = await Promise.all([...uploadPromises, createPromise]);

      showAlert("success", res.message || "Tạo dịch vụ thành công!");

      window.location.href = `/manage-services`;
    } catch (err: any) {
      showAlert("error", err.message || "Tạo dịch vụ thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Thông tin cơ bản
      </h2>

      <Form layout="vertical" disabled={loading}>
        <div className="grid grid-cols-2 gap-6">
          <Form.Item
            label="Tên dịch vụ"
            required
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              rules={{ required: "Tên dịch vụ không được bỏ trống" }}
              render={({ field }) => (
                <Input placeholder="Nhập tên dịch vụ" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Giá dịch vụ"
            required
            validateStatus={errors.price ? "error" : ""}
            help={errors.price ? "Giá phải lớn hơn 0" : ""}
          >
            <Controller
              name="price"
              control={control}
              rules={{ required: true, min: 0 }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  className="w-full"
                  placeholder="0.00"
                />
              )}
            />
          </Form.Item>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">
          Thông tin bổ sung
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <Form.Item
            label="Loại dịch vụ"
            required
            validateStatus={errors.service_type_id ? "error" : ""}
            help={errors.service_type_id ? "Vui lòng chọn loại dịch vụ" : ""}
          >
            <Controller
              name="service_type_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Chọn loại dịch vụ"
                  options={serviceTypes.map((st) => ({
                    label: st.name,
                    value: st.id,
                  }))}
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Trạng thái" required>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value}
                  onChange={(val) => field.onChange(!!val)}
                  options={[
                    { label: "Đang hoạt động", value: true },
                    { label: "Tạm ngưng", value: false },
                  ]}
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item label="Đường dẫn (Slug)">
          <Controller
            disabled
            name="slug"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>

        <Form.Item label="Hình ảnh dịch vụ" className="mt-6">
          <Controller
            name="images"
            control={control}
            render={({ field }) => {
              return (
                <>
                  <Dragger
                    multiple
                    accept="image/*"
                    listType="picture-card"
                    beforeUpload={() => false}
                    onPreview={handlePreview}
                    onChange={async (info) => {
                      const updatedList = await Promise.all(
                        info.fileList.map(async (f) => {
                          if (!f.url && !f.preview && f.originFileObj) {
                            f.preview = await getBase64(
                              f.originFileObj as RcFile
                            );
                          }
                          return f;
                        })
                      );

                      setValue(
                        "images",
                        updatedList
                          .map((f) => f.originFileObj)
                          .filter((f): f is RcFile => !!f)
                      );
                    }}
                    fileList={field.value?.map((file) => ({
                      uid: (file as any).uid || (file as any).name,
                      name: (file as any).name,
                      status: "done",
                      originFileObj: file,
                      preview: (file as any).preview,
                      url: undefined,
                    }))}
                    className="rounded-lg border-2 border-dashed border-[#608DBC] hover:border-[#3b5998] transition-all duration-300 p-4"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <InboxOutlined className="text-[#608DBC] text-4xl" />
                      <p className="text-gray-700 font-medium">
                        Kéo thả hình ảnh vào đây hoặc click để chọn
                      </p>
                      <Button
                        type="primary"
                        className="bg-[#608DBC] hover:bg-[#3b5998] border-none"
                      >
                        Chọn hình ảnh
                      </Button>
                    </div>
                  </Dragger>

                  <Modal
                    open={previewOpen}
                    title={previewTitle}
                    footer={null}
                    onCancel={handleCancel}
                  >
                    <Image
                      alt={previewTitle}
                      style={{ width: "100%" }}
                      src={previewImage}
                    />
                  </Modal>
                </>
              );
            }}
          />
        </Form.Item>

        <div className="flex justify-end mt-8 gap-3">
          <Button onClick={() => history.back()}>Hủy bỏ</Button>
          <Button
            type="primary"
            className="bg-[#608DBC]!"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo dịch vụ"}
          </Button>
        </div>
      </Form>

      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
      />
    </div>
  );
}
