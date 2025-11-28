/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Modal, Input, Button, message } from "antd";
import { createRequest } from "@/apis/request";

const { TextArea } = Input;

interface CreateRequestModalProps {
  open: boolean;
  onClose: () => void;
  requestTypeId: number;
  request: string;
}

export default function CreateRequestModal({
  open,
  onClose,
  requestTypeId,
  request,
}: CreateRequestModalProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      return message.warning("Vui lòng nhập nội dung!");
    }

    setLoading(true);

    try {
      await createRequest({
        request_type_id: requestTypeId,
        content,
      });

      message.success("Tạo yêu cầu thành công");

      setContent("");
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi tạo yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const title = `Tạo yêu cầu: ${request}`;

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      destroyOnClose
      footer={null}
    >
      <div className="mb-4">
        <label className="block mb-1 font-medium text-sm">Nội dung</label>
        <TextArea
          rows={4}
          placeholder="Nhập nội dung yêu cầu..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <Button
        type="primary"
        size="large"
        className="w-full"
        onClick={handleSubmit}
        loading={loading}
      >
        Tạo yêu cầu
      </Button>
    </Modal>
  );
}
