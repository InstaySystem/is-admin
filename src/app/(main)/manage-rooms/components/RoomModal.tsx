"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Floor, RoomType, Room } from "@/types/room";

interface RoomModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: Room | null;
  floors: Floor[]; // dùng để auto-suggest tầng
  roomTypes: RoomType[];
  onClose: () => void;
  onOk: (data: { name: string; floor: string; room_type_id: number }) => void;
}

export default function RoomModal({
  open,
  mode,
  initialData,
  floors,
  roomTypes,
  onClose,
  onOk,
}: RoomModalProps) {
  const [form, setForm] = useState({
    name: "",
    floor: "",
    room_type_id: 0,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    floor?: string;
    room_type_id?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Floor[]>([]); // auto-suggest floors
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // ============================ INIT ============================
  useEffect(() => {
    if (initialData && mode === "edit") {
      setForm({
        name: initialData.name ?? "",
        // initialData.floor may be object or string; prefer name if available
        floor:
          typeof initialData.floor === "string"
            ? initialData.floor
            : initialData.floor?.name ?? "",
        room_type_id: Number(
          initialData.room_type_id ?? initialData.room_type?.id ?? 0
        ),
      });
    } else {
      setForm({ name: "", floor: "", room_type_id: 0 });
    }
    setErrors({});
  }, [initialData, mode, open]);

  // focus input
  useEffect(() => {
    if (open) setTimeout(() => firstInputRef.current?.focus(), 120);
  }, [open]);

  // ESC để đóng modal
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [open, onClose]);

  // ============================ VALIDATE ============================
  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Tên phòng là bắt buộc";
    else if (form.name.trim().length < 2) e.name = "Tên phòng phải ≥ 2 ký tự";

    if (!form.floor.trim()) e.floor = "Tầng là bắt buộc";
    if (!form.room_type_id) e.room_type_id = "Chọn loại phòng";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ============================ SAVE ============================
  const handleSave = async () => {
    if (submitting) return;
    if (!validate()) return;

    try {
      setSubmitting(true);
      // onOk is expected to handle create-or-select-floor logic on server side
      await Promise.resolve();

      onOk({
        name: form.name.trim(),
        floor: form.floor.trim(),
        room_type_id: Number(form.room_type_id),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ============================ AUTO-SUGGEST FLOOR ============================
  const handleFloorInput = (value: string) => {
    setForm((s) => ({ ...s, floor: value }));

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const matched = floors.filter((f) =>
      f.name.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(matched.slice(0, 8));
  };

  const chooseSuggestion = (name: string) => {
    setForm((s) => ({ ...s, floor: name }));
    setSuggestions([]);
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center text-black"
          role="dialog"
          aria-modal="true"
        >
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
            transition={{ duration: 0.18 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-black">
              <div className="bg-[#608DBC] py-4 text-center text-lg font-semibold text-black">
                {mode === "create" ? "Thêm phòng" : "Chỉnh sửa phòng"}
              </div>

              <div className="p-6 text-black">
                <div className="bg-gray-50 p-4 rounded-md shadow-sm space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">
                      Tên phòng
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#608DBC] ${
                        errors.name ? "border-red-400" : "border-gray-300"
                      }`}
                      value={form.name}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, name: e.target.value }))
                      }
                      placeholder="Nhập tên phòng"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Floor (with auto-suggest) */}
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1 text-black">
                      Tầng
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#608DBC] ${
                        errors.floor ? "border-red-400" : "border-gray-300"
                      }`}
                      value={form.floor}
                      onChange={(e) => handleFloorInput(e.target.value)}
                      placeholder="Nhập tầng hoặc gõ để chọn"
                    />
                    {errors.floor && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.floor}
                      </p>
                    )}

                    {/* Suggestion Dropdown */}
                    {suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-auto">
                        {suggestions.map((f) => (
                          <div
                            key={f.id}
                            onClick={() => chooseSuggestion(f.name)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {f.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Room Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">
                      Loại phòng
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#608DBC] ${
                        errors.room_type_id
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      value={form.room_type_id}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          room_type_id: Number(e.target.value),
                        }))
                      }
                    >
                      <option value={0}>-- Chọn loại phòng --</option>
                      {roomTypes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    {errors.room_type_id && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.room_type_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex items-center justify-between px-6 py-4 text-black">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-lg px-4 py-2 border hover:bg-gray-50 transition"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="rounded-lg px-4 py-2 text-white bg-[#608DBC] hover:bg-[#4a7bb0] transition disabled:opacity-60"
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
