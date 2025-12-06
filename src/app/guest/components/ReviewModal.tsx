/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Button, message, Rate, Form } from "antd";
import { CreateReviewRequest, Review } from "@/types/reviews";

const { TextArea } = Input;

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReviewRequest) => Promise<void>;
  initialData?: Review | null;
  loading?: boolean;
}

export default function ReviewModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: ReviewModalProps) {
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [star, setStar] = useState(0);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setEmail(initialData.email || "");
      setContent(initialData.content || "");
      setStar(initialData.star || 0);
    } else {
      setEmail("");
      setContent("");
      setStar(0);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    const payload: CreateReviewRequest = {
      email,
      content,
      star,
    };

    await onSubmit(payload);
  };

  const isEditMode = !!initialData;

  return (
    <Modal
      title={isEditMode ? "Chỉnh sửa đánh giá" : "Tạo đánh giá"}
      open={open}
      onCancel={onClose}
      destroyOnClose
      footer={null}
    >
      <div className="mb-4">
        <label className="block mb-1 font-medium text-sm">Email</label>
        <Input
          placeholder="Nhập email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isEditMode}
          required
        />
      </div>

      <Form.Item required className="mb-4">
        <label className="block mb-1 font-medium text-sm">Số sao</label>
        <Rate value={star} onChange={(value) => setStar(value)} />
      </Form.Item>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-sm">Nội dung</label>
        <TextArea
          rows={4}
          placeholder="Nhập nội dung đánh giá..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <Button
        type="primary"
        size="large"
        className="w-full"
        onClick={handleSubmit}
        loading={loading}
      >
        {isEditMode ? "Cập nhật đánh giá" : "Tạo đánh giá"}
      </Button>
    </Modal>
  );
}
