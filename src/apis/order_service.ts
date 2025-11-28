/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosRequest from "@/config/axios";

export const getOrderServiceForAdmin = (params: any) => {
  return axiosRequest.get("/admin/orders/services", { params });
};

export const getOrderServiceById = (id: number) => {
  return axiosRequest.get(`/admin/orders/services/${id}`);
};

export const updateOrderServiceForAdmin = (id: number, payload: any) => {
  return axiosRequest.put(`/admin/orders/services/${id}`, payload);
};

export const getOrderServiceForGuest = () => {
  return axiosRequest.get("/orders/services");
};

export const updateOrderServiceForGuest = (id: number, payload: any) => {
  return axiosRequest.put(`/orders/services/${id}`, payload);
};
