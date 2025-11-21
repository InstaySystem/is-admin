/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table, Space, Button, Input, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import CustomAlert from "@/components/ui/CustomAlert";
import {
  getRoomTypes,
  deleteRoomType,
  createRoomType,
  updateRoomType,
} from "@/apis/room_type";
import { RoomType } from "@/types/room";
import { SearchOutlined } from "@ant-design/icons";
import CommonModal from "@/components/modals/CommonModal";
import RoomTypeModal from "./components/RoomTypeModal";

export default function ManageRoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<RoomType | null>(null);

  const fetchRoomTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRoomTypes();
      let items: RoomType[] = res.data.data.room_types || [];

      if (search) {
        items = items.filter((x) =>
          x.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      setRoomTypes(items);
    } catch (err: any) {
      message.error(err.message || "Lỗi tải danh sách loại phòng");
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingItem(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const item = roomTypes.find((x) => x.id === id);
    if (!item) return;

    setModalMode("edit");
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSubmitModal = async (data: { name: string }) => {
    try {
      if (modalMode === "create") {
        const res = await createRoomType(data);
        showAlert("success", res.data.message || "Đã tạo loại phòng");
      } else {
        if (!editingItem) return;
        const res = await updateRoomType(editingItem.id, data);
        showAlert("success", res.data.message || "Đã cập nhật loại phòng");
      }

      setIsEditModalOpen(false);
      fetchRoomTypes();
    } catch (error: any) {
      showAlert("error", error.message || "Lỗi xử lý");
    }
  };

  const handleOpenDeleteModal = (id: string) => {
    setIdToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;

    try {
      const res = await deleteRoomType(idToDelete);
      showAlert("success", res.data.message || "Xóa loại phòng thành công");
      setIsModalOpen(false);
      setIdToDelete(null);
      fetchRoomTypes();
    } catch (error: any) {
      showAlert("error", error.message);
    }
  };

  const columns = [
    {
      title: "Tên loại phòng",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Người tạo",
      key: "created_by",
      render: (_: unknown, record: RoomType) =>
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
      render: (_: unknown, record: RoomType) => (
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
        <div className="flex gap-3 items-center">
          <Input.Search
            placeholder="Tìm kiếm loại phòng..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] w-[250px]"
          />
        </div>

        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={openCreateModal}
        >
          Thêm loại phòng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roomTypes}
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
        title="Xác nhận xóa loại phòng"
        onClose={() => setIsModalOpen(false)}
        onOk={handleDelete}
      />

      <RoomTypeModal
        open={isEditModalOpen}
        mode={modalMode}
        initialData={editingItem}
        onClose={() => setIsEditModalOpen(false)}
        onOk={handleSubmitModal}
      />
    </div>
  );
}
