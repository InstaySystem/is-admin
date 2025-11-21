import axiosRequest from "@/config/axios";
import {
  CreateRequestTypeRequest,
  UpdateRequestTypeRequest,
} from "@/types/request";

export const getRequestTypes = async () => {
  return await axiosRequest.get("/admin/request-types");
};

export const createRequestType = async (data: CreateRequestTypeRequest) => {
  return await axiosRequest.post("/admin/request-types", data);
};

export const updateRequestType = async (
  requestTypeId: number,
  data: UpdateRequestTypeRequest
) => {
  return await axiosRequest.patch(
    `/admin/request-types/${requestTypeId}`,
    data
  );
};

export const deleteRequestType = async (requestTypeId: number) => {
  return await axiosRequest.delete(`/admin/request-types/${requestTypeId}`);
};
