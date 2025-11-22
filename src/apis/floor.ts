import axiosRequest from "@/config/axios";
import { Floor } from "@/types/room";

export const getFloors = async () => {
  return await axiosRequest.get("/admin/floors");
};
