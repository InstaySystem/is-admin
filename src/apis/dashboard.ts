import axiosRequest from "@/config/axios";

export const getDashboardData = () => {
  return axiosRequest.get("/admin/dashboard");
};
