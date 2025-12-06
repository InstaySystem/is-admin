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
let refreshPromise: Promise<string> | null = null;

const subscribeTokenRefresh = (cb: IRequestCb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];

  // Emit event để SSE reconnect với token mới
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tokenRefreshed"));
  }
};

// Axios chính cho app
const axiosRequest: AxiosInstance = axios.create({
  timeout: 10000,
  withCredentials: true,
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "indices", allowDots: true }),
});

// Axios riêng cho refresh token
const refreshAxios = axios.create({
  withCredentials: true,
});

let baseUrlPromise: Promise<string> | null = null;

async function getBaseUrl(): Promise<string> {
  if (!baseUrlPromise) {
    baseUrlPromise = fetch("/api/config")
      .then((r) => r.json())
      .then((data) => data.apiUrl);
  }
  return baseUrlPromise;
}

// Gắn token vào header
axiosRequest.interceptors.request.use(
  async (config) => {
    if (!config.baseURL) {
      config.baseURL = await getBaseUrl();
    }

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Nếu đang refresh, đợi promise đó hoàn thành
      if (isRefreshing) {
        return refreshPromise!
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${newToken}` };
            }
            return axiosRequest(originalRequest);
          })
          .catch(() => {
            clearRefreshTimer();
            return Promise.reject("Session expired. Please login again.");
          });
      }

      // Bắt đầu refresh token
      isRefreshing = true;

      refreshPromise = new Promise((resolve, reject) => {
        refreshAxios
          .post("/auth/refresh-token")
          .then(({ data }) => {
            if (!data?.accessToken)
              throw new Error("No accessToken in response");

            // Lưu token ngay
            setTokenServer(data);

            // Đặt lại lịch refresh
            scheduleTokenRefresh();

            // Thức dậy các request đang chờ + emit event cho SSE
            onRefreshed(data.accessToken);

            resolve(data.accessToken);
          })
          .catch((err) => {
            clearRefreshTimer();
            refreshSubscribers = [];
            reject("Session expired. Please login again.");
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      });

      // Retry request hiện tại với token mới
      return refreshPromise
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${newToken}` };
          }
          return axiosRequest(originalRequest);
        })
        .catch(() => {
          clearRefreshTimer();
          return Promise.reject("Session expired. Please login again.");
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
