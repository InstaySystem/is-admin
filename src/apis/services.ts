/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosRequest from "@/config/axios";
import { ServiceType, Service, CreateServiceRequest } from "@/types/service";

export const getServiceTypes = async () => {
  return await axiosRequest.get("/admin/service-types");
};

export const getServiceTypesForGuest = async () => {
  return await axiosRequest.get("/service-types");
};

export const createServiceType = async (data: ServiceType) => {
  return await axiosRequest.post("/admin/service-types", data);
};

export const updateServiceType = async (id: number, data: ServiceType) => {
  return await axiosRequest.patch(`/admin/service-types/${id}`, data);
};

export const deleteServiceType = async (id: number) => {
  return await axiosRequest.delete(`/admin/service-types/${id}`);
};

export const getServices = async (params: any) => {
  return await axiosRequest.get("/admin/services", { params });
};

export const getServiceById = async (id: number) => {
  return await axiosRequest.get(`/admin/services/${id}`);
};

export const createService = async (data: CreateServiceRequest) => {
  return await axiosRequest.post("/admin/services", data);
};

export const updateService = async (id: number, data: Service) => {
  return await axiosRequest.patch(`/admin/services/${id}`, data);
};

export const deleteService = async (id: number) => {
  return await axiosRequest.delete(`/admin/services/${id}`);
};
