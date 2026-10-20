"use client";

const RESET_EMAIL_KEY = "reset_password_email";

export function setResetPasswordEmail(email) {
  if (typeof window === "undefined" || !email) return;
  window.sessionStorage.setItem(RESET_EMAIL_KEY, email);
}

export function getResetPasswordEmail() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(RESET_EMAIL_KEY) || "";
}

export function clearResetPasswordEmail() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(RESET_EMAIL_KEY);
}
