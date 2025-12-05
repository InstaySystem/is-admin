import axiosRequest from "@/config/axios";

export const getFloors = async () => {
  return await axiosRequest.get("/admin/floors");
};
