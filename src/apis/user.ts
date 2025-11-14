import axiosRequest from "@/config/axios";
import { CreateUserRequest, UpdateUserRequest } from "@/types/user";

export const getUsers = async (params: unknown) => {
  return await axiosRequest.get("/admin/users", { params });
};

export const getUserById = async (userId: number) => {
  return await axiosRequest.get(`/admin/users/${userId}`);
};

export const updateUser = (userId: number, data: UpdateUserRequest) => {
  return axiosRequest.patch(`/admin/users/${userId}`, data);
};

export const getRoles = () => {
  return axiosRequest.get("/admin/users/roles");
};

export const deleteUser = (userId: number) => {
  return axiosRequest.delete(`/admin/users/${userId}`);
};

export const createUser = (data: CreateUserRequest) => {
  return axiosRequest.post("/admin/users", data);
};
