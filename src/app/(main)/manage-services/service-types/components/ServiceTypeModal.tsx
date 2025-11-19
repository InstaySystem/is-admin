"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ServiceType } from "@/types/service";
import { Department } from "@/types/user";

type Mode = "create" | "edit";

interface ServiceTypeModalProps {
  open: boolean;
  mode: Mode;
  initialData?: ServiceType | null;
  departments: Department[];
  onClose: () => void;
  onOk: (data: { name: string; department_id: number }) => void;
}

export default function ServiceTypeModal({
  open,
  mode,
  initialData,
  departments,
  onClose,
  onOk,
}: ServiceTypeModalProps) {
  const [form, setForm] = useState({
    name: "",
    department_id: 0,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    department_id?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setForm({
        name: initialData.name ?? "",
        department_id:
          initialData.department_id &&
          typeof initialData.department_id === "number"
            ? initialData.department_id
            : initialData.department?.id ?? 0,
      });
    } else {
      setForm({ name: "", department_id: 0 });
    }
    setErrors({});
  }, [initialData, mode, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name || !form.name.trim()) e.name = "Tên là bắt buộc";
    else if (form.name.trim().length < 2) e.name = "Tên ít nhất 2 ký tự";
    if (!form.department_id || form.department_id === 0)
      e.department_id = "Chọn phòng ban";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (submitting) return;
    if (!validate()) return;
    try {
      setSubmitting(true);
      await Promise.resolve();
      onOk({
        name: form.name.trim(),
        department_id: Number(form.department_id),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center text-black"
          aria-modal="true"
          role="dialog"
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
            role="document"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-black">
              <div className="text-center bg-[#608DBC] font-semibold text-lg py-4 text-black">
                {mode === "create"
                  ? "Thêm loại dịch vụ"
                  : "Chỉnh sửa loại dịch vụ"}
              </div>

              <div className="p-6 text-black">
                <div className="bg-gray-50 p-4 rounded-md shadow-sm space-y-4 text-black">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">
                      Tên loại dịch vụ
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, name: e.target.value }))
                      }
                      className={`w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#608DBC] ${
                        errors.name ? "border-red-400" : "border-gray-300"
                      }`}
                      placeholder="Nhập tên loại dịch vụ"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-black block text-sm font-medium mb-1">
                      Phòng ban
                    </label>
                    <select
                      value={form.department_id}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          department_id: Number(e.target.value),
                        }))
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#608DBC] ${
                        errors.department_id
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                    >
                      <option value={0}>-- Chọn phòng ban --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.display_name ?? d.name}
                        </option>
                      ))}
                    </select>
                    {errors.department_id && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.department_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="text-black flex items-center justify-between px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 border hover:bg-gray-50 transition"
                  aria-label="Đóng"
                  disabled={submitting}
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg px-4 py-2 text-white bg-[#608DBC] hover:bg-[#4a7bb0] transition disabled:opacity-60 disabled:cursor-not-allowed"
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
