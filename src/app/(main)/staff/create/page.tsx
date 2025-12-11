/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, Controller } from "react-hook-form";
import { Input, Button, Select, Form, Switch } from "antd";
import { useEffect, useState } from "react";
import { getDepartments } from "@/apis/department";
import { getRoles, createUser } from "@/apis/user";
import { Department, CreateUserRequest } from "@/types/user";
import { FaUserCircle, FaKey, FaWallet } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/providers/MessageProvider";

const { Option } = Select;

export default function CreateUserPage() {
  const router = useRouter();
  const msg = useMessage();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserRequest>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      role: undefined,
      department_id: undefined,
      is_active: true,
    },
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await getDepartments();
        setDepartments(res.data.data.departments);
      } catch (error: any) {
        msg.error(error);
      }
    };

    const fetchRoles = async () => {
      try {
        const res = await getRoles();
        setRoles(res.data.data.roles);
      } catch (error: any) {
        msg.error(error);
      }
    };

    fetchDepartments();
    fetchRoles();
  }, []);

  const onSubmit = async (data: CreateUserRequest) => {
    setLoading(true);
    try {
      const res = await createUser(data);
      msg.success(res.data.message);
      router.push("/staff");
    } catch (error: any) {
      msg.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 text-black">
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <h3 className="text-lg font-medium py-4 border-b mb-4 border-gray-200 flex items-center gap-2">
          <FaUserCircle />
          <span>Thông tin Cá nhân</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Họ"
            required
            validateStatus={errors.first_name ? "error" : ""}
            help={errors.first_name && "Trường này không được để trống"}
          >
            <Controller
              name="first_name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Nhập họ"
                  value={field.value || ""}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Tên"
            required
            validateStatus={errors.last_name ? "error" : ""}
            help={errors.last_name && "Trường này không được để trống"}
          >
            <Controller
              name="last_name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Nhập tên"
                  value={field.value || ""}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            required
            validateStatus={errors.email ? "error" : ""}
            help={errors.email && "Trường này không được để trống"}
          >
            <Controller
              name="email"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Nhập email"
                  value={field.value || ""}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            required
            validateStatus={errors.phone ? "error" : ""}
            help={errors.phone && "Trường này không được để trống"}
          >
            <Controller
              name="phone"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Nhập số điện thoại"
                  value={field.value || ""}
                />
              )}
            />
          </Form.Item>
        </div>

        <h3 className="flex items-center gap-2 text-lg font-medium py-4 mb-4 border-b border-gray-200">
          <FaWallet />
          <span>Thông tin Công việc</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Phòng ban"
            required
            validateStatus={errors.department_id ? "error" : ""}
            help={errors.department_id && "Phòng ban không được để trống"}
          >
            <Controller
              name="department_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Chọn phòng ban"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                >
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name} - {dept.display_name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Trạng thái">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Switch
                    checked={field.value ?? false}
                    onChange={(checked) => field.onChange(checked)}
                  />
                  <span
                    className={`font-semibold text-sm px-3 py-1 rounded-full ${
                      field.value
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {field.value ? "Đang làm" : "Nghỉ làm"}
                  </span>
                </div>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            required
            validateStatus={errors.role ? "error" : ""}
            help={errors.role && "Vai trò không được để trống"}
          >
            <Controller
              name="role"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Chọn vai trò"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                >
                  {Object.entries(roles).map(([label, value]) => (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>
        </div>

        <h3 className="flex items-center gap-2 text-lg font-medium mt-6 py-4 mb-4 border-b border-gray-200">
          <FaKey />
          <span>Thông tin Tài khoản</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Tên đăng nhập"
            required
            validateStatus={errors.username ? "error" : ""}
            help={errors.username && "Trường này không được để trống"}
          >
            <Controller
              name="username"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Tên đăng nhập"
                  value={field.value || ""}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            required
            validateStatus={errors.password ? "error" : ""}
            help={errors.password && "Trường này không được để trống"}
          >
            <Controller
              name="password"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Mật khẩu"
                  value={field.value || ""}
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item className="mt-6">
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo người dùng
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
