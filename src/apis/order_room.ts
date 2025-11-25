import axiosRequest from "@/config/axios";

export const createOrderRoomAdmin = (payload: {
  booking_id: number;
  room_id: number;
}) => {
  return axiosRequest.post("/admin/orders/rooms", payload);
};

export const verifyOrderRoomAdmin = (secret_code: string) => {
  return axiosRequest.post("/orders/rooms/verify", { secret_code });
};

export const createOrderService = (payload: {
  service_id: number;
  quantity: number;
  guest_note: string;
}) => {
  return axiosRequest.post("/orders/services", payload);
};

export const getOrderRoomById = (id: number) => {
  return axiosRequest.get(`/admin/orders/rooms/${id}`);
};
