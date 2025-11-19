import axiosRequest from "@/config/axios";

export const getServiceTypes = () => {
  return axiosRequest.get("/admin/service-types");
};

export const createServiceType = (data: {
  name: string;
  department_id: number;
}) => {
  return axiosRequest.post("/admin/service-types", data);
};

export const updateServiceType = (
  id: number,
  data: {
    name?: string;
    department_id?: number;
  }
) => {
  return axiosRequest.patch(`/admin/service-types/${id}`, data);
};

export const deleteServiceType = (id: number) => {
  return axiosRequest.delete(`/admin/service-types/${id}`);
};
