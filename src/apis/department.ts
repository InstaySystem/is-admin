import axiosRequest from "@/config/axios";
import { Department } from "@/types/user";

export const getDepartments = async () => {
  return await axiosRequest.get("/admin/departments");
};

export const createDepartment = async (data: Partial<Department>) => {
  return await axiosRequest.post("/admin/departments", data);
};

export const updateDepartment = async (
  departmentId: number,
  data: Partial<Department>
) => {
  return await axiosRequest.patch(`/admin/departments/${departmentId}`, data);
};

export const deleteDepartment = async (departmentId: number) => {
  return await axiosRequest.delete(`/admin/departments/${departmentId}`);
};
