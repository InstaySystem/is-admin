/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table, Tag, Space, Button, Input, Select, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getUsers, getRoles, deleteUser } from "@/apis/user";
import { getDepartments } from "@/apis/department";
import CustomAlert from "@/components/ui/CustomAlert";
import { Department, User } from "@/types/user";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getInitialAvatar } from "@/utils/getInitialAvatar";
import CommonModal from "@/components/modals/CommonModal";

export default function EmployeeTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [departments, setDepartments] = useState<Department[]>();
  const [roles, setRoles] = useState();
  const [departmentId, setDepartmentId] = useState<number | undefined>(
    undefined
  );
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const router = useRouter();

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        page,
        limit,
        search,
        role,
        department_id: departmentId,
        is_active: isActive,
        sort: "created_at",
        order: "desc",
      });

      setUsers(response.data.data.users || []);
    } catch (err: any) {
      message.error(err.message || "Lỗi tải danh sách nhân viên");
    }
    setLoading(false);
  }, [page, limit, search, role, departmentId, isActive]);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data.data.departments || []);
    } catch (err: any) {
      message.error(err.message || "Lỗi tải danh sách phòng ban");
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await getRoles();
      setRoles(response.data.data.roles || []);
    } catch (err: any) {
      message.error(err.message || "Lỗi tải danh sách vai trò");
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (id: number) => {
    router.push(`/staff/${id}/edit`);
  };

  const handleOpenDeleteModal = (id: number) => {
    setIdToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;

    try {
      const res = await deleteUser(idToDelete);
      showAlert("success", res.data.message || "Xóa nhân viên thành công");
      setIsModalOpen(false);
      setIdToDelete(null);
      fetchUsers();
    } catch (error: any) {
      showAlert("error", error);
    }
  };

  const columns = [
    {
      title: "Họ và tên",
      key: "name",
      render: (_: any, record: User) => {
        const fullName = `${record.first_name} ${record.last_name}`;
        const { initials, color } = getInitialAvatar(fullName);

        return (
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-base"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>
            <span>{fullName}</span>
          </div>
        );
      },
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
          <Button
            size="small"
            danger
            onClick={() => handleOpenDeleteModal(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }} className="text-lg">
      <div className="flex flex-wrap gap-3 justify-between items-start mb-4 text-lg">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Space.Compact className="min-w-[200px] w-[250px] max-sm:w-full">
            <Input
              placeholder="Tìm kiếm nhân viên..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              className="bg-[#608DBC]!"
              onClick={() => fetchUsers()}
            />
          </Space.Compact>

          <Select
            allowClear
            placeholder="Vai trò"
            className="min-w-40 max-sm:w-full"
            value={role}
            onChange={setRole}
            options={
              roles
                ? Object.entries(roles).map(([label, value]) => ({
                    label,
                    value,
                  }))
                : []
            }
          />

          <Select
            allowClear
            placeholder="Phòng ban"
            className="min-w-[200px] max-sm:w-full"
            value={departmentId}
            onChange={setDepartmentId}
            options={
              departments
                ? departments.map((d) => ({
                    label: d.display_name,
                    value: d.id,
                  }))
                : []
            }
          />

          <Select
            allowClear
            placeholder="Trạng thái"
            className="min-w-[150px] max-sm:w-full"
            value={isActive}
            onChange={setIsActive}
            options={[
              { value: true, label: "Đang làm" },
              { value: false, label: "Ngừng" },
            ]}
          />
        </div>
        <Button
          type="primary"
          className="bg-[#608DBC]! max-sm:w-full"
          onClick={() => router.push("/staff/create")}
        >
          Thêm nhân viên
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={false}
        rowKey="id"
        className="text-lg"
      />

      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
      />

      <CommonModal
        open={isModalOpen}
        title="Xác nhận xóa nhân viên"
        onClose={() => setIsModalOpen(false)}
        onOk={handleDelete}
      />
    </div>
  );
}
