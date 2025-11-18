import axiosRequest from "@/config/axios";

export const generateUploadPresignedUrls = (payload: {
  files: {
    file_name: string;
    content_type: string;
  }[];
}) => {
  return axiosRequest.post("/files/presigned-urls/uploads", payload);
};

export const generateViewPresignedUrls = (payload: { keys: string[] }) => {
  return axiosRequest.post("/files/presigned-urls/views", payload);
};
