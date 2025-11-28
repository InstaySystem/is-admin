/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosRequest from "@/config/axios";

export const getRequestsForAdmin = (params: any) => {
  return axiosRequest.get("/admin/requests", { params });
};

export const getRequestById = (id: number) => {
  return axiosRequest.get(`/admin/requests/${id}`);
};

export const updateRequestForAdmin = (id: number, payload: any) => {
  return axiosRequest.put(`/admin/requests/${id}`, payload);
};

export const createRequest = (payload: any) => {
  return axiosRequest.post(`/requests`, payload);
};

export const getRequestsForGuest = (params: any) => {
  return axiosRequest.get("/requests", { params });
};

export const updateRequestsForGuest = (id: number, payload: any) => {
  return axiosRequest.put(`/requests/${id}`, payload);
};
