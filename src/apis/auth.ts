import axiosRequest from "@/config/axios";
import axios from "axios";

export const login = (data: { username: string; password: string }) => {
  return axiosRequest.post("auth/login", data);
};

export const register = (data: {
  username: string;
  email: string;
  password: string;
}) => {
  return axiosRequest.post("auth/sign-up", data);
};

export const getMe = async () => {
  try {
    return await axiosRequest.get("/auth/me");
  } catch (error) {
    console.log(error);
  }
};

export const verifyOtp = async (data: {
  forgot_password_token: string;
  otp: string;
}) => {
  try {
    const res = await axiosRequest.post("/auth/forgot-password/verify", data);
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const setTokenServer = async (data: object) => {
  try {
    const res = await axios.post("/api/auth", { data });
    return res;
  } catch (error) {
    console.log("errors", error);
  }
};

export const getRefreshToken = () => {
  return axiosRequest.get("/auth/refresh");
};

export const deleteTokenServer = async () => {
  try {
    const res = await axios.delete("/api/auth");
    return res;
  } catch (error) {
    console.log("errors", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    const res = await axiosRequest.post("/auth/sign-out");
    deleteTokenServer();
    return res;
  } catch (error) {
    console.log("errors", error);
    throw error;
  }
};

export const forgotPassword = (email: string) => {
  return axiosRequest.post("/auth/forgot-password", { email });
};

export const resetPassword = (data: {
  new_password: string;
  reset_password_token: string;
}) => {
  return axiosRequest.post("/auth/reset-password", data);
};

export const logout = () => {
  return axiosRequest.post("/auth/sign-out");
};
