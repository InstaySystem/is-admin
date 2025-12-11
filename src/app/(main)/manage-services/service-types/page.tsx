/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table, Tag, Space, Button, Input, Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  getServiceTypes,
  deleteServiceType,
  createServiceType,
  updateServiceType,
} from "@/apis/service_types";
import { ServiceType } from "@/types/service";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CommonModal from "@/components/modals/CommonModal";
import { getDepartments } from "@/apis/department";
import { Department } from "@/types/user";
import ServiceTypeModal from "./components/ServiceTypeModal";
import { useMessage } from "@/app/providers/MessageProvider";

export default function ManageServiceTypes() {
  const router = useRouter();

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [departments, setDepartments] = useState<Department[]>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<ServiceType | null>(null);

  const msg = useMessage();

  const openCreateModal = () => {
    setModalMode("create");
    setEditingItem(null);
    setIsEditModalOpen(true);
  };

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.data.departments || []);
    } catch (err: any) {
      msg.error(err);
    }
  }, [msg]);

  const fetchServiceTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getServiceTypes();
      let items: ServiceType[] = res.data.data.service_types || [];

      if (search) {
        items = items.filter((x) =>
          x.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (departmentId) {
        items = items.filter((x) => x.department_id === departmentId);
      }

      setServiceTypes(items);
    } catch (err: any) {
      msg.error(err);
    }
    setLoading(false);
  }, [msg, search, departmentId]);

  useEffect(() => {
    fetchDepartments();
    fetchServiceTypes();
  }, [fetchServiceTypes, fetchDepartments]);

  const handleEdit = (id: number) => {
    const item = serviceTypes.find((x) => x.id === id);
    if (!item) return;

    setModalMode("edit");
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSubmitModal = async (data: {
    name: string;
    department_id: number;
  }) => {
    try {
      if (modalMode === "create") {
        const res = await createServiceType(data);
        msg.success(res.data.message);
      } else {
        if (!editingItem) return;
        const res = await updateServiceType(editingItem.id, data);
        msg.success(res.data.message);
      }

      setIsEditModalOpen(false);
      fetchServiceTypes();
    } catch (error: any) {
      msg.error(error);
    }
  };

  const handleOpenDeleteModal = (id: number) => {
    setIdToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;

    try {
      const res = await deleteServiceType(idToDelete);
      msg.success(res.data.message);
      setIsModalOpen(false);
      setIdToDelete(null);
      fetchServiceTypes();
    } catch (error: any) {
      msg.error(error);
    }
  };

  const columns = [
    {
      title: "Tên loại dịch vụ",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Phòng ban",
      key: "department",
      render: (_: any, record: ServiceType) =>
        record.department ? record.department.display_name : "—",
    },
    {
      title: "Số lượng dịch vụ",
      dataIndex: "service_count",
      key: "service_count",
      render: (count: number) => <Tag>{count}</Tag>,
    },
    {
      title: "Người tạo",
      key: "created_by",
      render: (_: any, record: ServiceType) =>
        record.created_by?.first_name ?? "—",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: ServiceType) => (
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
              placeholder="Tìm kiếm loại dịch vụ..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              className="bg-[#608DBC]!"
              onClick={() => fetchServiceTypes()}
            />
          </Space.Compact>

          <Select
            allowClear
            placeholder="Phòng ban"
            className="min-w-[200px]"
            value={departmentId}
            onChange={setDepartmentId}
            options={[
              { value: 1, label: "Chung" },
              { value: 2, label: "Kỹ thuật" },
              { value: 3, label: "Vệ sinh" },
            ]}
          />
        </div>

        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={() => router.push("/manage-services")}
        >
          Quay lại Danh sách dịch vụ
        </Button>

        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={openCreateModal}
        >
          Thêm loại dịch vụ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={serviceTypes}
        loading={loading}
        rowKey="id"
        className="text-lg"
      />

      <CommonModal
        open={isModalOpen}
        title="Xác nhận xóa loại dịch vụ"
        onClose={() => setIsModalOpen(false)}
        onOk={handleDelete}
      />

      <ServiceTypeModal
        open={isEditModalOpen}
        mode={modalMode}
        initialData={editingItem}
        departments={departments || []}
        onClose={() => setIsEditModalOpen(false)}
        onOk={handleSubmitModal}
      />
    </div>
  );
}
