import axios from "axios";
import CookieUniversal from "cookie-universal";
import {
  ADMIN_AUTH_TOKEN_COOKIE,
  BASE_URL,
} from "@/api/config";
import { clearAdminSession } from "@/api/instance";

const cookies = CookieUniversal();

const adminApi = axios.create({
  baseURL: BASE_URL,
});

adminApi.interceptors.request.use(
  (config) => {
    const token = cookies.get(ADMIN_AUTH_TOKEN_COOKIE);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAdminLoginRequest = requestUrl.includes("auth/login");

    if (error.response?.status === 401 && !isAdminLoginRequest) {
      clearAdminSession();

      if (typeof window !== "undefined") {
        const pathParts = window.location.pathname.split("/");
        const locale = pathParts[1] || "en";
        window.location.href = `/${locale}/admin_auth/login`;
      }
    }

    return Promise.reject(error);
  },
);

export default adminApi;
