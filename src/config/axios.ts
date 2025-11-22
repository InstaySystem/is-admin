// api/axiosClient.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import qs from "qs";
import { getCookie } from "@/utils/cookies";
import { ACCESS_TOKEN } from "@/constants/token";
import { setTokenServer } from "@/apis/auth";
import { scheduleTokenRefresh, clearRefreshTimer } from "@/utils/token";

type IRequestCb = (token: string) => void;

let isRefreshing = false;
let refreshSubscribers: IRequestCb[] = [];

const subscribeTokenRefresh = (cb: IRequestCb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

// Axios chính cho app
const axiosRequest: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "indices", allowDots: true }),
});

// Axios riêng cho refresh token
const refreshAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Gắn token vào header
axiosRequest.interceptors.request.use(
  (config) => {
    const token = getCookie(ACCESS_TOKEN);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response
axiosRequest.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401) {
      if (originalRequest._retry) {
        clearRefreshTimer();
        return Promise.reject("Unauthorized.");
      }

      originalRequest._retry = true;

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${newToken}` };
          }
          resolve(axiosRequest(originalRequest));
        });

        if (!isRefreshing) {
          isRefreshing = true;
          refreshAxios
            .post("/auth/refresh-token")
            .then(({ data }) => {
              if (!data?.accessToken)
                throw new Error("No accessToken in response");

              // Lưu token ngay
              setTokenServer(data);

              // Đặt lại lịch refresh
              scheduleTokenRefresh();

              // Thức dậy các request đang chờ
              onRefreshed(data.accessToken);
            })
            .catch((err) => {
              clearRefreshTimer();
              refreshSubscribers = [];
              reject("Session expired. Please login again.");
            })
            .finally(() => {
              isRefreshing = false;
            });
        }
      });
    }

    if (error.code === AxiosError.ERR_NETWORK) {
      return Promise.reject("Network error. Please check your connection.");
    }

    return Promise.reject(
      error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
        ? (error.response.data as { message: string }).message
        : "Unexpected error."
    );
  }
);

export default axiosRequest;

// Bootstrap khi app khởi chạy
export function bootstrapAuthTimer() {
  const token = getCookie(ACCESS_TOKEN);
  if (token) {
    scheduleTokenRefresh();
  } else {
    clearRefreshTimer();
  }
}
