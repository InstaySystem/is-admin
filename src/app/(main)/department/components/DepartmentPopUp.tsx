"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Department } from "@/types/user";
import { FaTimes } from "react-icons/fa";

type Mode = "create" | "edit" | "view";

interface DepartmentPopUpProps {
  open: boolean;
  mode: Mode;
  initialData?: Department | null;
  onClose: () => void;
  onOk: (data: {
    name?: string;
    display_name?: string;
    description?: string;
  }) => void;
}

export default function DepartmentPopUp({
  open,
  mode,
  initialData,
  onClose,
  onOk,
}: DepartmentPopUpProps) {
  const [form, setForm] = useState({
    name: "",
    display_name: "",
    description: "",
  });

  const firstInputRef = useRef<HTMLInputElement>(null);
  const isView = mode === "view";
  useEffect(() => {
    if (initialData && mode !== "create") {
      setForm({
        name: initialData.name || "",
        display_name: initialData.display_name || "",
        description: initialData.description || "",
      });
    } else {
      setForm({ name: "", display_name: "", description: "" });
    }
  }, [initialData, mode, open]);
  useEffect(() => {
    if (open && !isView) {
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [open, isView]);

  const handleSave = () => {
    onOk({
      name: form.name || undefined,
      display_name: form.display_name || undefined,
      description: form.description || undefined,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-black">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-[#608DBC] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold">
                {mode === "create" && "Thêm phòng ban"}
                {mode === "edit" && "Chỉnh sửa phòng ban"}
                {mode === "view" && "Chi tiết phòng ban"}
              </h3>
              <button
                onClick={onClose}
                className="hover:bg-white/20 p-1 rounded-full transition"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tên phòng ban <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  disabled={isView}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nhập tên phòng ban..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#608DBC] disabled:bg-gray-100 disabled:text-gray-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  disabled={isView}
                  value={form.display_name}
                  onChange={(e) =>
                    setForm({ ...form, display_name: e.target.value })
                  }
                  placeholder="Nhập tên hiển thị..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#608DBC] disabled:bg-gray-100 disabled:text-gray-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={4}
                  disabled={isView}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Mô tả chi tiết..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#608DBC] disabled:bg-gray-100 disabled:text-gray-500 resize-none transition"
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
              >
                Đóng
              </button>

              {!isView && (
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-[#608DBC] text-white hover:bg-[#4a7bb0] transition font-medium shadow-md"
                >
                  {mode === "create" ? "Tạo mới" : "Cập nhật"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
