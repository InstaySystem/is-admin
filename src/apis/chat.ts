import axiosRequest from "@/config/axios";

export const getChatsForGuest = () => {
  return axiosRequest.get(`/chats`);
};

export const getChatByIdForGuest = (chatId: string | undefined) => {
  return axiosRequest.get(`/chats/${chatId}`);
};

export const getChatsForAdmin = () => {
  return axiosRequest.get(`/admin/chats`);
};

export const getChatByIdForAdmin = (chatId: string) => {
  return axiosRequest.get(`/admin/chats/${chatId}`);
};
