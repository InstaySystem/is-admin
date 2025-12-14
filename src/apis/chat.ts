import axiosRequest from "@/config/axios";

export const getChatsForGuest = () => {
  return axiosRequest.get(`/chats/me`);
};

export const getChatByIdForGuest = (chatId: string | undefined) => {
  return axiosRequest.get(`/chats/${chatId}`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getChatsForAdmin = (params?: any) => {
  return axiosRequest.get(`/admin/chats`, { params });
};

export const getChatByIdForAdmin = (chatId: string) => {
  return axiosRequest.get(`/admin/chats/${chatId}`);
};
