/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table, Tag, Space, Button, Input, Select, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getServices, deleteService } from "@/apis/services";
import { getServiceTypes } from "@/apis/services";
import CustomAlert from "@/components/ui/CustomAlert";
import { Service, ServiceType } from "@/types/service";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CommonModal from "@/components/modals/CommonModal";

export default function ManageService() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState<number | undefined>(
    undefined
  );
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>();

  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const router = useRouter();

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getServices({
        page,
        limit,
        search,
        service_type_id: serviceTypeId,
        is_active: isActive,
        sort: "created_at",
        order: "desc",
      });

      setServices(response.data.data.services || []);
    } catch (err: any) {
      message.error(err.message || "Lỗi tải danh sách dịch vụ");
    }
    setLoading(false);
  }, [page, limit, search, serviceTypeId, isActive]);

  const fetchServiceTypes = useCallback(async () => {
    try {
      const res = await getServiceTypes();
      setServiceTypes(res.data.data.service_types || []);
    } catch (err: any) {
      message.error("Lỗi tải loại dịch vụ");
    }
  }, []);

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleEdit = (id: number) => {
    router.push(`/manage-services/${id}`);
  };

  const handleOpenDeleteModal = (id: number) => {
    setIdToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;

    try {
      const res = await deleteService(idToDelete);
      showAlert("success", res.data.message || "Xóa dịch vụ thành công");
      setIsModalOpen(false);
      setIdToDelete(null);
      fetchServices();
    } catch (error: any) {
      showAlert("error", error);
    }
  };

  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Loại dịch vụ",
      key: "service_type",
      render: (_: any, record: Service) =>
        record.service_type ? record.service_type.name : "—",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) =>
        price.toLocaleString("en-US", { style: "currency", currency: "USD" }),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Service) => (
        <Space>
          <Button
            size="small"
            type="primary"
            className="bg-[#608DBC]!"
            onClick={() => handleEdit(record.id)}
          >
            Sửa
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
    <div style={{ padding: 24 }} className="text-lg">
      <div className="flex flex-wrap gap-3 justify-between items-start mb-4 text-lg">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Space.Compact className="min-w-[200px] w-[250px]">
            <Input
              placeholder="Tìm kiếm dịch vụ..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              className="bg-[#608DBC]!"
              onClick={() => fetchServices()}
            />
          </Space.Compact>

          <Select
            allowClear
            placeholder="Loại dịch vụ"
            className="min-w-[200px]"
            value={serviceTypeId}
            onChange={setServiceTypeId}
            options={
              serviceTypes
                ? serviceTypes.map((t) => ({
                    label: t.name,
                    value: t.id,
                  }))
                : []
            }
          />

          <Select
            allowClear
            placeholder="Trạng thái"
            className="min-w-[150px]"
            value={isActive}
            onChange={setIsActive}
            options={[
              { value: true, label: "Hoạt động" },
              { value: false, label: "Ngừng" },
            ]}
          />
        </div>

        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={() => router.push("/manage-services/create")}
        >
          Thêm dịch vụ
        </Button>

        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={() => router.push("/manage-services/service-types")}
        >
          Loại dịch vụ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={services}
        loading={loading}
        pagination={false}
        rowKey="id"
        className="text-lg"
      />

      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
      />

      <CommonModal
        open={isModalOpen}
        title="Xác nhận xóa dịch vụ"
        onClose={() => setIsModalOpen(false)}
        onOk={handleDelete}
      />
    </div>
  );
}
