"use client";

import { Modal, Form, Input } from "antd";

interface Props {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => void;
}

export default function ChangePasswordModal({
  open,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [form] = Form.useForm();

  return (
    <Modal
      open={open}
      title="Đổi mật khẩu"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Đổi mật khẩu"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Mật khẩu hiện tại"
          name="old_password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="new_password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirm_password"
          rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
