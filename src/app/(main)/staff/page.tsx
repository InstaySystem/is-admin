/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Avatar,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { getUsers, getUserById } from "@/apis/user";
import CustomAlert from "@/components/ui/CustomAlert";
import { User } from "@/types/user";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function EmployeeTable() {
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState();
  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data.data.users);
        console.log(response.data.data.users);
        setAlert({
          open: true,
          type: "success",
          message: response.data.message,
        });
      } catch (error: any) {
        setAlert({
          open: true,
          type: "error",
          message:
            error.message || "Đã xảy ra lỗi khi tải danh sách nhân viên.",
        });
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/staff/${id}/edit`);
  };

  const columns = [
    {
      title: "Họ và tên",
      key: "name",
      render: (_: any, record: User) =>
        `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) =>
        role === "admin" ? (
          <Tag color="purple">Admin</Tag>
        ) : (
          <Tag color="blue">Nhân viên</Tag>
        ),
    },
    {
      title: "Phòng ban",
      key: "department",
      render: (_: any, record: User) =>
        record.department ? record.department.display_name : "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Đang làm</Tag>
        ) : (
          <Tag color="red">Ngừng</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (value: string) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: User) => (
        <Space>
          <Button
            size="small"
            type="primary"
            className="bg-[#608DBC]!"
            onClick={() => handleEdit(record.id)}
          >
            Sửa
          </Button>
          <Button size="small" danger>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }} className="text-lg">
      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 8,
        }}
        className="text-lg"
      >
        <div style={{ display: "flex", gap: 8 }}>
          <Space.Compact style={{ width: 220 }}>
            <Input placeholder="Tìm kiếm nhân viên..." allowClear />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              className="bg-[#608DBC]! text-lg"
            />
          </Space.Compact>

          <Select
            value={filter}
            style={{ width: 160 }}
            onChange={setFilter}
            options={[
              { value: "all", label: "Tất cả phòng ban" },
              { value: "letan", label: "Lễ tân" },
              { value: "housekeeping", label: "Housekeeping" },
            ]}
          />
        </div>
        <Button type="primary" className="bg-[#608DBC]!">
          Thêm nhân viên
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        pagination={false}
        className="text-lg"
      />
    </div>
  );
}
