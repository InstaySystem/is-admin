/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosRequest from "@/config/axios";
import { CreateReviewRequest, ReviewPaginationQuery } from "@/types/reviews";

export const getAllReviewsAdmin = (params?: ReviewPaginationQuery) => {
  return axiosRequest.get("/admin/reviews", { params });
};

export const getMyReview = () => {
  return axiosRequest.get("/reviews/me");
};

export const createReview = (payload?: CreateReviewRequest) => {
  return axiosRequest.post("/reviews", payload);
};

export const updateReview = (id: number, payload?: any) => {
  return axiosRequest.patch("/reviews/me", payload);
};
