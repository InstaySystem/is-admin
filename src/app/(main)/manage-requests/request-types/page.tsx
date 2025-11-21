/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, Button, Input, Space, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import CustomAlert from "@/components/ui/CustomAlert";
import CommonModal from "@/components/modals/CommonModal";

import {
  getRequestTypes,
  deleteRequestType,
  createRequestType,
  updateRequestType,
} from "@/apis/request_type";

import { getDepartments } from "@/apis/department";

import { RequestType } from "@/types/request";
import RequestTypeModal from "./components/RequestTypeModal";

export default function ManageRequestTypes() {
  const [items, setItems] = useState<RequestType[]>([]);
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<RequestType | null>(null);

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.data.departments || []);
    } catch (err: any) {
      message.error(err?.message || "Lỗi tải danh sách phòng ban");
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRequestTypes();
      let list: RequestType[] = res.data.data.request_types || [];

      if (search) {
        list = list.filter((x) =>
          x.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      setItems(list);
    } catch (err: any) {
      message.error(err?.message || "Lỗi tải danh sách");
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchItems();
    fetchDepartments();
  }, [fetchItems, fetchDepartments]);

  const openCreate = () => {
    setModalMode("create");
    setEditingItem(null);
    setIsEditModalOpen(true);
  };

  const openEdit = (item: RequestType) => {
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
        const res = await createRequestType(data);
        showAlert("success", res.data.message || "Tạo loại yêu cầu thành công");
      } else {
        if (!editingItem) return;
        const res = await updateRequestType(editingItem.id, data);
        showAlert("success", res.data.message || "Cập nhật thành công");
      }
      setIsEditModalOpen(false);
      fetchItems();
    } catch (err: any) {
      showAlert("error", err?.message || "Lỗi xử lý");
    }
  };

  const handleOpenDelete = (id: number) => {
    setDeleteId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await deleteRequestType(deleteId);
      showAlert("success", res.data.message || "Xóa thành công");
      setIsModalOpen(false);
      setDeleteId(null);
      fetchItems();
    } catch (err: any) {
      showAlert("error", err?.message);
    }
  };

  const columns = [
    {
      title: "Tên loại yêu cầu",
      dataIndex: "name",
      render: (t: string) => <span className="font-medium">{t}</span>,
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      render: (d: any) => d?.display_name ?? "—",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      render: (d: any) => d.first_name ?? "—",
    },
    {
      title: "Thao tác",
      render: (_: unknown, record: RequestType) => (
        <Space>
          <Button
            size="small"
            type="primary"
            className="bg-[#608DBC]!"
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleOpenDelete(record.id)}
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
        <div className="flex gap-3 items-center">
          <Input.Search
            placeholder="Tìm kiếm loại yêu cầu..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] w-[250px]"
          />
        </div>

        <Button type="primary" className="bg-[#608DBC]!" onClick={openCreate}>
          Thêm loại yêu cầu
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey="id"
      />

      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
      />

      <CommonModal
        open={isModalOpen}
        title="Xác nhận xóa loại yêu cầu"
        onClose={() => setIsModalOpen(false)}
        onOk={handleDelete}
      />

      <RequestTypeModal
        open={isEditModalOpen}
        mode={modalMode}
        initialData={editingItem}
        departments={departments}
        onClose={() => setIsEditModalOpen(false)}
        onOk={handleSubmitModal}
      />
    </div>
  );
}
