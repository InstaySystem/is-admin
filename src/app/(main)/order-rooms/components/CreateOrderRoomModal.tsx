/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Modal, Select } from "antd";
import { Room } from "@/types/room";

interface Props {
  open: boolean;
  onCancel: () => void;
  onOk: (roomId: number) => void;
  rooms: Room[];
}

export default function CreateOrderRoomModal({
  open,
  onCancel,
  onOk,
  rooms,
}: Props) {
  const [roomId, setRoomId] = useState<number | null>(null);

  const handleOk = () => {
    if (roomId) onOk(roomId);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title="Tạo đơn phòng"
      okText="Tạo đơn"
      cancelText="Hủy"
    >
      <div className="mt-4">
        <label className="block mb-1 text-sm font-medium">Chọn Phòng</label>
        <Select
          className="w-full"
          size="large"
          placeholder="Chọn phòng..."
          onChange={(v) => setRoomId(v)}
          options={
            rooms.length > 0
              ? rooms.map((r) => ({
                  label: `${r.name} — ${r.room_type?.name} (Tầng ${
                    r.floor || "N/A"
                  })`,
                  value: r.id,
                }))
              : [
                  {
                    label: "Không còn loại phòng này",
                    value: "-1",
                    disabled: true,
                  } as any,
                ]
          }
        />
      </div>
    </Modal>
  );
}
