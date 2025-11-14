"use client";

import { motion } from "framer-motion";

interface CommonModalProps {
  open: boolean;
  title: string;
  onOk: () => void;
  onClose: () => void;
}

export default function CommonModal({
  open,
  title,
  onOk,
  onClose,
}: CommonModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#b4d1ff] p-8 rounded-lg shadow-lg w-[600px] text-center"
      >
        <h2 className="text-2xl font-semibold text-black mb-10 leading-relaxed">
          {title}
        </h2>

        <div className="flex justify-center gap-10">
          <button
            onClick={onOk}
            className="px-6 py-2 rounded-md bg-[#4f81bd] text-white text-lg font-medium hover:opacity-90"
          >
            Có
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md bg-[#d9534f] text-white text-lg font-medium hover:opacity-90"
          >
            Không
          </button>
        </div>
      </motion.div>
    </div>
  );
}
