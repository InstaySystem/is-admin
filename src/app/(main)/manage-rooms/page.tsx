/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table, Space, Button, Input, Select, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getRooms, deleteRoom } from "@/apis/room";

import { getRoomTypes } from "@/apis/room_type";

import { Room } from "@/types/room";
import { RoomType } from "@/types/room";
import { Floor } from "@/types/room";

import CustomAlert from "@/components/ui/CustomAlert";
import CommonModal from "@/components/modals/CommonModal";
import { SearchOutlined } from "@ant-design/icons";

export default function ManageRoom() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [roomTypeId, setRoomTypeId] = useState<string | undefined>(undefined);
  const [floorId, setFloorId] = useState<string | undefined>(undefined);

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);

  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const router = useRouter();

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRooms({
        page,
        limit,
        search,
        room_type_id: roomTypeId,
        floor_id: floorId,
        order: "desc",
        sort: "created_at",
      });

      setRooms(response.data.data.rooms || []);
    } catch (err: any) {
      showAlert("error", err.message || "Lỗi tải danh sách loại phòng");
    }
    setLoading(false);
  }, [page, limit, search, roomTypeId, floorId]);

  const fetchRoomTypes = useCallback(async () => {
    try {
      const res = await getRoomTypes();
      setRoomTypes(res.data.data.room_types || []);
    } catch (err: any) {
      showAlert("error", err.message || "Lỗi tải danh sách loại phòng");
    }
  }, []);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleEdit = (id: string) => {
    router.push(`/manage-rooms/${id}`);
  };

  const handleOpenDeleteModal = (id: string) => {
    setIdToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;

    try {
      const res = await deleteRoom(idToDelete);
      showAlert("success", res.data.message || "Xóa phòng thành công");
      setIsModalOpen(false);
      setIdToDelete(null);
      fetchRooms();
    } catch (error: any) {
      showAlert("error", error);
    }
  };

  const columns = [
    {
      title: "Tên phòng",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Loại phòng",
      key: "room_type",
      render: (_: any, record: Room) =>
        record.room_type ? record.room_type.name : "—",
    },
    {
      title: "Tầng",
      key: "floor",
      render: (_: any, record: Room) =>
        record.floor ? record.floor.name : "—",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Room) => (
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
              placeholder="Tìm kiếm phòng..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              className="bg-[#608DBC]!"
              onClick={() => fetchRooms()}
            />
          </Space.Compact>

          <Select
            allowClear
            placeholder="Loại phòng"
            className="min-w-[200px]"
            value={roomTypeId}
            onChange={setRoomTypeId}
            options={roomTypes.map((t) => ({
              label: t.name,
              value: t.id,
            }))}
          />

          <Select
            allowClear
            placeholder="Tầng"
            className="min-w-[150px]"
            value={floorId}
            onChange={setFloorId}
            options={floors.map((f) => ({
              label: f.name,
              value: f.id,
            }))}
          />
        </div>

        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={() => router.push("/manage-rooms/create")}
        >
          Thêm phòng
        </Button>

        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={() => router.push("/manage-rooms/room-types")}
        >
          Loại phòng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rooms}
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
        title="Xác nhận xóa phòng"
        onClose={() => setIsModalOpen(false)}
        onOk={handleDelete}
      />
    </div>
  );
}
