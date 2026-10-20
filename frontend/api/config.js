const BACKEND_ORIGIN = "https://binn-oxar.onrender.com";

export const BASE_URL = `${BACKEND_ORIGIN}/api/v1/`;
export const IMAGEURL = `${BACKEND_ORIGIN}/kyc/`;
export const USER_AUTH_TOKEN_COOKIE = "user_token";
export const ADMIN_AUTH_TOKEN_COOKIE = "admin_token";
export const AUTH_TOKEN_COOKIE = USER_AUTH_TOKEN_COOKIE;
export const AUTH_ROLE_COOKIE = "auth_role";
export const AUTH_USER_COOKIE = "auth_user";
export const AUTH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "184541568719-hvdldik6hqqguo3f5m5afvi8quhd8rfc.apps.googleusercontent.com";
