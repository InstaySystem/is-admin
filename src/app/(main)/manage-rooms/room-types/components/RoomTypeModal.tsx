"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomType } from "@/types/room";

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  mode: Mode;
  initialData?: RoomType | null;
  onClose: () => void;
  onOk: (data: { name: string }) => void;
}

export default function RoomTypeModal({
  open,
  mode,
  initialData,
  onClose,
  onOk,
}: Props) {
  const [form, setForm] = useState({ name: "" });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setForm({ name: initialData.name ?? "" });
    } else {
      setForm({ name: "" });
    }
    setErrors({});
  }, [initialData, mode, open]);

  useEffect(() => {
    if (open) setTimeout(() => firstInputRef.current?.focus(), 120);
  }, [open]);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Tên là bắt buộc";
    else if (form.name.trim().length < 2) e.name = "Tên ít nhất 2 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      await Promise.resolve();
      onOk({ name: form.name.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center text-black">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-2xl mx-4"
            initial={{ opacity: 0, y: -30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-black">
              <div className="text-center bg-[#608DBC] font-semibold text-lg py-4">
                {mode === "create" ? "Thêm loại phòng" : "Chỉnh sửa loại phòng"}
              </div>

              <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-md shadow-sm space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên loại phòng
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, name: e.target.value }))
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#608DBC] ${
                        errors.name ? "border-red-400" : "border-gray-300"
                      }`}
                      placeholder="Nhập tên loại phòng"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex items-center justify-between px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 border hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg px-4 py-2 text-white bg-[#608DBC] hover:bg-[#4a7bb0] transition disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting
                    ? mode === "create"
                      ? "Đang tạo..."
                      : "Đang cập nhật..."
                    : mode === "create"
                    ? "Tạo mới"
                    : "Cập nhật"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
