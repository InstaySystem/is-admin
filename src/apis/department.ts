import axiosRequest from "@/config/axios";
import { Department } from "@/types/user";

export const getDepartments = async () => {
  return await axiosRequest.get("/departments");
};

export const createDepartment = async (data: Partial<Department>) => {
  return await axiosRequest.post("/departments", data);
};

export const updateDepartment = async (
  departmentId: number,
  data: Partial<Department>
) => {
  return await axiosRequest.patch(`/departments/${departmentId}`, data);
};

export const deleteDepartment = async (departmentId: number) => {
  return await axiosRequest.delete(`/departments/${departmentId}`);
};
