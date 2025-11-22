import axiosRequest from "@/config/axios";

export interface BookingPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  filter?: string;
  from?: string;
  to?: string;
  search?: string;
}

export const getBookings = (query?: BookingPaginationQuery) => {
  return axiosRequest.get("/admin/bookings", { params: query });
};

export const getBookingById = (id: number | string) => {
  return axiosRequest.get(`/admin/bookings/${id}`);
};
