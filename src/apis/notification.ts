import axiosRequest from "@/config/axios";

export const getNotificationsForAdmin = () => {
  return axiosRequest.get("/admin/notifications");
};

export const countUnreadNotifications = () => {
  return axiosRequest.get(`/admin/notifications/unread-count`);
};

export const getNotificationsForGuest = () => {
  return axiosRequest.get("/notifications");
};

export const countUnreadNotificationsForGuest = () => {
  return axiosRequest.get(`/notifications/unread-count`);
};
