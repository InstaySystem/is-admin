import axiosRequest from "@/config/axios";
import { UpdateUserRequest } from "@/types/user";

export const getUsers = async (page = 1, limit = 10) => {
  return await axiosRequest.get("/users", {
    params: { page, limit },
  });
};

export const getUserById = async (userId: number) => {
  return await axiosRequest.get(`/users/${userId}`);
};

export const updateUser = (userId: number, data: UpdateUserRequest) => {
  return axiosRequest.patch(`/users/${userId}`, data);
};

export const getRoles = () => {
  return axiosRequest.get("/users/roles");
};
