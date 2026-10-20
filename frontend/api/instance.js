import axios from "axios";
import CookieUniversal from "cookie-universal";
import {
  ADMIN_AUTH_TOKEN_COOKIE,
  AUTH_ROLE_COOKIE,
  AUTH_TOKEN_MAX_AGE,
  AUTH_USER_COOKIE,
  BASE_URL,
  USER_AUTH_TOKEN_COOKIE,
} from "@/api/config";
import { normalizeAuthUser, parseStoredAuthUser } from "@/lib/auth-user";

const cookies = CookieUniversal();
const USER_TOKEN_KEY = USER_AUTH_TOKEN_COOKIE;
const ADMIN_TOKEN_KEY = ADMIN_AUTH_TOKEN_COOKIE;
const ROLE_KEY = AUTH_ROLE_COOKIE;
const USER_KEY = AUTH_USER_COOKIE;

const getCookieOptions = (expiresDate) => {
  const isSecureRequest =
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : process.env.NODE_ENV === "production";

  return {
    expires: expiresDate,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest,
  };
};

const getExpiryDate = () => {
  const expiresDate = new Date();
  expiresDate.setTime(expiresDate.getTime() + AUTH_TOKEN_MAX_AGE * 1000);
  return expiresDate;
};

const setUserToken = (token) => {
  if (!token) return;
  cookies.set(USER_TOKEN_KEY, token, getCookieOptions(getExpiryDate()));
};

const getUserToken = () => cookies.get(USER_TOKEN_KEY) || null;

const removeUserToken = () => {
  cookies.remove(USER_TOKEN_KEY, { path: "/" });
};

const setAdminToken = (token) => {
  if (!token) return;
  cookies.set(ADMIN_TOKEN_KEY, token, getCookieOptions(getExpiryDate()));
};

const getAdminToken = () => cookies.get(ADMIN_TOKEN_KEY) || null;

const removeAdminToken = () => {
  cookies.remove(ADMIN_TOKEN_KEY, { path: "/" });
};

const setUserRole = (role) => {
  if (!role) return;
  cookies.set(ROLE_KEY, role, getCookieOptions(getExpiryDate()));
};

const getUserRole = () => cookies.get(ROLE_KEY) || null;

const removeUserRole = () => {
  cookies.remove(ROLE_KEY, { path: "/" });
};

const setAuthUserCookie = (user) => {
  const normalizedUser = normalizeAuthUser(user);
  if (!normalizedUser) return;
  cookies.set(
    USER_KEY,
    JSON.stringify(normalizedUser),
    getCookieOptions(getExpiryDate()),
  );
};

const getAuthUserCookie = () => parseStoredAuthUser(cookies.get(USER_KEY));

const removeAuthUserCookie = () => {
  cookies.remove(USER_KEY, { path: "/" });
};

const setAuthSession = ({ token, role, user }) => {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "admin") {
    setAdminToken(token);
  } else {
    setUserToken(token);
  }

  setUserRole(role);

  const normalizedUser = normalizeAuthUser(user);
  if (normalizedUser) {
    setAuthUserCookie(normalizedUser);
  }
};

const clearUserSession = () => {
  removeUserToken();
  removeAuthUserCookie();
  if (getUserRole() === "user") {
    removeUserRole();
  }
};

const clearAdminSession = () => {
  removeAdminToken();
  if (getUserRole() === "admin") {
    removeUserRole();
  }
};

const clearAuthSession = () => {
  removeUserToken();
  removeAdminToken();
  removeUserRole();
  removeAuthUserCookie();
};

const logout = (locale = "en") => {
  clearAuthSession();

  if (typeof window !== "undefined") {
    window.location.href = `/${locale}/`;
  }
};

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getUserToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isLoginRequest =
      requestUrl.includes("auth/login") ||
      requestUrl.includes("admin/login") ||
      requestUrl.includes("auth/google");

    const isBlocked = error.response?.status === 403;
    if ((error.response?.status === 401 || isBlocked) && !isLoginRequest) {
      clearUserSession();

      if (typeof window !== "undefined") {
        const pathParts = window.location.pathname.split("/");
        const locale = pathParts[1] || "en";
        window.location.href = `/${locale}/user_auth/login`;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

export {
  clearAdminSession,
  clearAuthSession,
  clearUserSession,
  getAdminToken,
  getAuthUserCookie,
  getUserRole,
  getUserToken,
  logout,
  removeAdminToken,
  removeAuthUserCookie,
  removeUserRole,
  removeUserToken,
  setAdminToken,
  setAuthSession,
  setAuthUserCookie,
  setUserRole,
  setUserToken,
};

export const setTokenToCookie = setUserToken;
export const getTokenFromCookie = getUserToken;
export const removeTokenFromCookie = removeUserToken;
export const setToken = setUserToken;
export const getToken = getUserToken;
export const removeToken = removeUserToken;
