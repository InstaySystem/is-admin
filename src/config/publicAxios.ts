import axios from "axios";
import qs from "qs";

export const publicAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "indices", allowDots: true }),
});
