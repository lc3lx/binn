export const DEFAULT_BACKEND_ORIGIN = "https://binn-oxar.onrender.com";

const resolveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const url = process.env.NEXT_PUBLIC_API_URL;
    return url.endsWith("/") ? url : `${url}/`;
  }

  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocal) {
      return "http://127.0.0.1:8000/api/v1/";
    }
    return `${DEFAULT_BACKEND_ORIGIN}/api/v1/`;
  }

  return `${DEFAULT_BACKEND_ORIGIN}/api/v1/`;
};

const resolveImageUrl = () => {
  if (process.env.NEXT_PUBLIC_IMAGE_URL) {
    const url = process.env.NEXT_PUBLIC_IMAGE_URL;
    return url.endsWith("/") ? url : `${url}/`;
  }

  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocal) {
      return "http://127.0.0.1:8000/kyc/";
    }
    return `${DEFAULT_BACKEND_ORIGIN}/kyc/`;
  }

  return `${DEFAULT_BACKEND_ORIGIN}/kyc/`;
};

export const BASE_URL = resolveBaseUrl();
export const IMAGEURL = resolveImageUrl();

export const USER_AUTH_TOKEN_COOKIE = "user_token";
export const ADMIN_AUTH_TOKEN_COOKIE = "admin_token";
export const AUTH_TOKEN_COOKIE = USER_AUTH_TOKEN_COOKIE;
export const AUTH_ROLE_COOKIE = "auth_role";
export const AUTH_USER_COOKIE = "auth_user";
export const AUTH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "184541568719-hvdldik6hqqguo3f5m5afvi8quhd8rfc.apps.googleusercontent.com";
