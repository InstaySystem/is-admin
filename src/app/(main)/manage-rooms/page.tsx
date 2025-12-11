/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table, Tag, Space, Button, Input, Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getFloors } from "@/apis/floor";
import { getRooms, deleteRoom, createRoom, updateRoom } from "@/apis/room";
import { getRoomTypesFilter } from "@/apis/room_type";
import { Room, Floor, RoomType } from "@/types/room";
import CommonModal from "@/components/modals/CommonModal";
import { SearchOutlined } from "@ant-design/icons";
import RoomModal from "./components/RoomModal";
import { useAppStore } from "@/stores/useAppStore";
import { useMessage } from "@/app/providers/MessageProvider";

export default function ManageRoom() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [roomTypeId, setRoomTypeId] = useState<string | undefined>(undefined);
  const [floorId, setFloorId] = useState<string | undefined>(undefined);

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [inUse, setInUse] = useState<boolean | undefined>();

  const isAdmin = useAppStore((s) => s._role) === "admin";

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomModalMode, setRoomModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [roomModalInitial, setRoomModalInitial] = useState<Room | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const msg = useMessage();

  const fetchFloors = useCallback(async () => {
    try {
      const res = await getFloors();
      setFloors(res.data.data.floors || []);
    } catch (err: any) {
      msg.error(err);
    }
  }, [msg]);

  const fetchRoomTypes = useCallback(async () => {
    try {
      const res = await getRoomTypesFilter();
      setRoomTypes(res.data.data.room_types || []);
    } catch (err: any) {
      msg.error(err);
    }
  }, [msg]);

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
        in_use: inUse,
      });

      setRooms(response.data.data.rooms || []);
      setTotal(response.data.data.meta.total || 0);
    } catch (err: any) {
      msg.error(err);
    }
    setLoading(false);
  }, [msg, page, limit, search, roomTypeId, floorId, inUse]);

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
      msg.success(res.data.message);
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
      fetchRooms();
    } catch (error: any) {
      msg.error(error);
    }
  };

  const handleSaveRoom = async (data: any) => {
    try {
      if (roomModalMode === "create") {
        const res = await createRoom(data);
        msg.success(res.data.message);
      } else {
        const res = await updateRoom(roomModalInitial!.id, data);
        msg.success(res.data.message);
      }

      setRoomModalOpen(false);
      fetchRooms();
    } catch (error: any) {
      msg.error(error);
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
        record.floor ? (
          <span>
            {typeof record.floor === "string" ? record.floor : record.floor}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "in_use",
      key: "in_use",
      render: (active: boolean) =>
        active ? (
          <Tag color="blue">Đang ở</Tag>
        ) : (
          <Tag color="green">Trống</Tag>
        ),
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

  const filteredColumns = isAdmin
    ? columns
    : columns.filter((col) => col.key !== "action");

  return (
    <div style={{ padding: 24 }} className="text-lg">
      <div className="flex flex-wrap gap-3 justify-between items-start mb-4 text-lg">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Space.Compact className="min-w-[200px] w-[250px]">
            <Input
              placeholder="Tìm kiếm phòng..."
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              className="bg-[#608DBC]!"
              onClick={() => {
                setPage(1);
                fetchRooms();
              }}
            />
          </Space.Compact>

          <Select
            allowClear
            placeholder="Loại phòng"
            className="min-w-[200px]"
            value={roomTypeId}
            onChange={(value) => {
              setRoomTypeId(value);
              setPage(1);
            }}
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
            onChange={(value) => {
              setFloorId(value);
              setPage(1);
            }}
            options={floors.map((f) => ({
              label: f.name,
              value: f.id,
            }))}
          />

          <Select
            allowClear
            placeholder="Trạng thái"
            className="min-w-[150px]"
            value={inUse}
            onChange={(value) => {
              setInUse(value);
              setPage(1);
            }}
            options={[
              {
                label: "Đang ở",
                value: true,
              },
              {
                label: "Trống",
                value: false,
              },
            ]}
          />
        </div>

        {isAdmin && (
          <>
            <Button
              type="primary"
              className="bg-[#608DBC]!"
              onClick={handleCreate}
            >
              Thêm phòng
            </Button>
            <Button
              type="primary"
              className="bg-[#608DBC]!"
              onClick={() =>
                (window.location.href = "/manage-rooms/room-types")
              }
            >
              Loại phòng
            </Button>
          </>
        )}
      </div>

      <Table
        columns={filteredColumns}
        dataSource={rooms}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        rowKey="id"
        className="text-lg"
      />

      <CommonModal
        open={isDeleteModalOpen}
        title="Xác nhận xóa phòng"
        onClose={() => setIsDeleteModalOpen(false)}
        onOk={handleDelete}
      />

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
