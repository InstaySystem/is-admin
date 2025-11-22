/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table, Space, Button, Input, Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getFloors } from "@/apis/floor";
import { getRooms, deleteRoom, createRoom, updateRoom } from "@/apis/room";
import { getRoomTypes } from "@/apis/room_type";
import { Room, Floor, RoomType } from "@/types/room";
import CustomAlert from "@/components/ui/CustomAlert";
import CommonModal from "@/components/modals/CommonModal";
import { SearchOutlined } from "@ant-design/icons";
import RoomModal from "./components/RoomModal";

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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomModalMode, setRoomModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [roomModalInitial, setRoomModalInitial] = useState<Room | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const fetchFloors = useCallback(async () => {
    try {
      const res = await getFloors();
      setFloors(res.data.data.floors || []);
    } catch (err: any) {
      showAlert("error", err.message || "Lỗi tải danh sách tầng");
    }
  }, []);

  const fetchRoomTypes = useCallback(async () => {
    try {
      const res = await getRoomTypes();
      setRoomTypes(res.data.data.room_types || []);
    } catch (err: any) {
      showAlert("error", err.message || "Lỗi tải danh sách loại phòng");
    }
  }, []);

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
      showAlert("error", err.message || "Lỗi tải danh sách phòng");
    }
    setLoading(false);
  }, [page, limit, search, roomTypeId, floorId]);

  useEffect(() => {
    fetchFloors();
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreate = () => {
    setRoomModalMode("create");
    setRoomModalInitial(null);
    setRoomModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setRoomModalMode("edit");
    setRoomModalInitial(room);
    setRoomModalOpen(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!idToDelete) return;

    try {
      const res = await deleteRoom(idToDelete);
      showAlert("success", res.data.message || "Xóa phòng thành công");
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
      fetchRooms();
    } catch (error: any) {
      showAlert("error", error.message || "Lỗi xóa phòng");
    }
  };

  const handleSaveRoom = async (data: any) => {
    try {
      if (roomModalMode === "create") {
        const res = await createRoom(data);
        showAlert("success", res.data.message || "Tạo phòng thành công");
      } else {
        const res = await updateRoom(roomModalInitial!.id, data);
        showAlert("success", res.data.message || "Cập nhật phòng thành công");
      }

      setRoomModalOpen(false);
      fetchRooms();
    } catch (error: any) {
      showAlert("error", error.message || "Có lỗi xảy ra");
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
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Room) => (
        <Space>
          <Button
            size="small"
            type="primary"
            className="bg-[#608DBC]!"
            onClick={() => handleEdit(record)}
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

        <Button type="primary" className="bg-[#608DBC]!" onClick={handleCreate}>
          Thêm phòng
        </Button>

        <Button
          type="primary"
          className="bg-[#608DBC]!"
          onClick={() => (window.location.href = "/manage-rooms/room-types")}
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
        open={isDeleteModalOpen}
        title="Xác nhận xóa phòng"
        onClose={() => setIsDeleteModalOpen(false)}
        onOk={handleDelete}
      />

      {/* ROOM MODAL */}
      <RoomModal
        open={roomModalOpen}
        mode={roomModalMode}
        initialData={roomModalInitial}
        floors={floors}
        roomTypes={roomTypes}
        onClose={() => setRoomModalOpen(false)}
        onOk={handleSaveRoom}
      />
    </div>
  );
}
