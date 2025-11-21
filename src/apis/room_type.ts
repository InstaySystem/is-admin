import axiosRequest from "@/config/axios";
import { CreateRoomTypeRequest, UpdateRoomTypeRequest } from "@/types/room";

export const getRoomTypes = async () => {
  return await axiosRequest.get("/admin/room-types");
};

export const createRoomType = async (data: CreateRoomTypeRequest) => {
  return await axiosRequest.post("/admin/room-types", data);
};

export const updateRoomType = async (
  id: string,
  data: UpdateRoomTypeRequest
) => {
  return await axiosRequest.put(`/admin/room-types/${id}`, data);
};

export const deleteRoomType = async (id: string) => {
  return await axiosRequest.delete(`/admin/room-types/${id}`);
};
