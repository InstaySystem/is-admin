import axiosRequest from "@/config/axios";

export const getChatsForGuest = () => {
  return axiosRequest.get(`/chats`);
};

export const getChatByIdForGuest = (chatId: number) => {
  return axiosRequest.get(`/chats/${chatId}`);
};

export const getChatsForAdmin = () => {
  return axiosRequest.get(`/admin/chats`);
};

export const getChatByIdForAdmin = (chatId: number) => {
  return axiosRequest.get(`/admin/chats/${chatId}`);
};
