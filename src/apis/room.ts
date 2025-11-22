/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosRequest from "@/config/axios";
import { CreateRoomRequest, UpdateRoomRequest } from "@/types/room";

export const getRooms = async (params?: any) => {
  return await axiosRequest.get("/admin/rooms", { params });
};

export const getRoomById = async (id: string) => {
  return await axiosRequest.get(`/admin/rooms/${id}`);
};

export const createRoom = async (data: CreateRoomRequest) => {
  return await axiosRequest.post("/admin/rooms", data);
};

export const updateRoom = async (id: string, data: UpdateRoomRequest) => {
  return await axiosRequest.patch(`/admin/rooms/${id}`, data);
};

export const deleteRoom = async (id: string) => {
  return await axiosRequest.delete(`/admin/rooms/${id}`);
};
