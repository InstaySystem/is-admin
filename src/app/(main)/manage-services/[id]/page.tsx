/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Input, Button, Select, InputNumber, Form } from "antd";
import { RcFile } from "antd/es/upload";
import { useParams } from "next/navigation";
import ImagesUploader from "../components/ImagesUploader";
import CustomAlert from "@/components/ui/CustomAlert";
import {
  getServiceTypes,
  getServiceById,
  updateService,
} from "@/apis/services";
import {
  generateUploadPresignedUrls,
  generateViewPresignedUrls,
} from "@/apis/file";
import { ServiceType } from "@/types/service";
import { getBase64 } from "@/utils/image";

interface FormValues {
  name: string;
  price: number;
  slug?: string;
  is_active: boolean;
  service_type_id?: number;
  images: any[];
}

export default function EditServicePage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });
  const [fileList, setFileList] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any>(null);

  const params = useParams();
  const serviceId = Number(params.id);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
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

  const showAlert = (type: typeof alert.type, message: string) =>
    setAlert({ open: true, type, message });

  const replaceUrl = (input: string) =>
    input ? input.replace(/\\u0026/g, "&") : input;

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

  useEffect(() => {
    (async () => {
      try {
        const res = await getServiceById(serviceId);
        const service = res.data.data.service;

        reset({
          name: service.name,
          price: service.price,
          is_active: service.is_active,
          service_type_id: service.service_type?.id,
        });

        setOriginalData({
          name: service.name,
          price: service.price,
          is_active: service.is_active,
          service_type_id: service.service_type?.id,
          images: service.images || [],
        });

        if (service.images?.length) {
          const keys = service.images.map((img: any) => img.key);
          const urlsRes = await generateViewPresignedUrls({ keys });
          const presignedUrls = urlsRes.data.data.presigned_url;

          const mapped = service.images.map((img: any, index: number) => ({
            uid: `old-${img.id}`,
            id: img.id,
            key: img.key,
            name: img.name || img.key,
            url: replaceUrl(presignedUrls[index]?.url || img.url || ""),
            preview: replaceUrl(presignedUrls[index]?.url || img.url || ""),
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
  }, [serviceId, reset, setValue]);

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

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.service_type_id) {
      showAlert("error", "Vui lòng chọn loại dịch vụ");
      return;
    }
    if (!originalData) {
      showAlert("error", "Không thể tải dữ liệu gốc");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {};

      if (data.name !== originalData.name) payload.name = data.name;
      if (data.price !== originalData.price) payload.price = data.price;
      if (data.is_active !== originalData.is_active)
        payload.is_active = data.is_active;
      if (data.service_type_id !== originalData.service_type_id)
        payload.service_type_id = data.service_type_id;

      const currentFiles = fileList;
      const newFiles = currentFiles.filter((f) => f.originFileObj);
      const existingFiles = currentFiles.filter((f) => f.id);
      const originalIds = (originalData.images || []).map((img) => img.id);
      const currentIds = existingFiles.map((img) => img.id);
      const deleteImages = originalIds.filter((id) => !currentIds.includes(id));

      // Handle new images
      let newImagesPayload: any[] = [];
      if (newFiles.length > 0) {
        const filesMeta = newFiles.map((nf) => ({
          file_name: nf.name,
          content_type: nf.originFileObj?.type || "application/octet-stream",
        }));
        const presignedRes = await generateUploadPresignedUrls({
          files: filesMeta,
        });
        const presignedFiles = presignedRes.data.data.presigned_urls;

        newImagesPayload = presignedFiles.map((ps: any, idx: number) => ({
          key: ps.key,
          is_thumbnail: idx === 0,
          sort_order: idx + 1,
          file: newFiles[idx].originFileObj,
        }));

        await Promise.all(
          newImagesPayload.map((item, idx) =>
            fetch(presignedFiles[idx].upload_url || presignedFiles[idx].url, {
              method: "PUT",
              body: item.file,
              headers: {
                "Content-Type": item.file.type || "application/octet-stream",
              },
            })
          )
        );

        payload.new_images = newImagesPayload.map((f) => ({
          key: f.key,
          is_thumbnail: f.is_thumbnail,
          sort_order: f.sort_order,
        }));
      }

      // Handle update existing images
      if (existingFiles.length > 0) {
        const updatedExisting = existingFiles
          .map((f) => {
            const original = (originalData.images || []).find(
              (img) => img.id === f.id
            );
            if (!original) return null;

            const isThumbnailChanged =
              !!f.is_thumbnail !== !!original.is_thumbnail;
            const isSortOrderChanged =
              Number(f.sort_order ?? 0) !== Number(original.sort_order ?? 0);

            if (isThumbnailChanged || isSortOrderChanged) {
              return {
                id: f.id,
                key: f.key,
                is_thumbnail: !!f.is_thumbnail,
                sort_order: Number(f.sort_order ?? 0),
              };
            }
            return null;
          })
          .filter(Boolean);

        if (updatedExisting.length > 0) payload.update_images = updatedExisting;
      }

      if (deleteImages.length > 0) payload.delete_images = deleteImages;

      if (Object.keys(payload).length === 0) {
        showAlert("info", "Không có thay đổi nào để cập nhật");
        setLoading(false);
        return;
      }

      const res = await updateService(serviceId, payload);
      showAlert("success", res.data.message || "Cập nhật dịch vụ thành công!");
    } catch (err: any) {
      console.error(err);
      showAlert("error", err.message || "Cập nhật dịch vụ thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Chỉnh sửa dịch vụ
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

        <div className="grid grid-cols-2 gap-6 mt-6">
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
            render={() => (
              <ImagesUploader
                fileList={fileList}
                setFileList={setFileList}
                setValue={setValue}
                handlePreview={handlePreview}
              />
            )}
          />
        </Form.Item>

        <div className="flex justify-end mt-8 gap-3">
          <Button onClick={() => history.back()}>Hủy bỏ</Button>
          <Button
            type="primary"
            className="bg-[#608DBC]! "
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật dịch vụ"}
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
