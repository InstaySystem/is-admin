import axiosRequest from "@/config/axios";

export const getSources = async () => {
  return await axiosRequest.get("/admin/sources");
};
