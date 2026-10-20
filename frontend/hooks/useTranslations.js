"use client";

import { usePathname } from "next/navigation";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

function getByPath(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

export function useTranslations() {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) || [];
  const locale = segments[0] === "ar" ? "ar" : "en";
  const messages = locale === "ar" ? ar : en;
  const t = (key, params) => {
    let str = getByPath(messages, key);
    if (typeof str === "string" && params && typeof params === "object") {
      Object.keys(params).forEach((k) => {
        str = str.replaceAll(`{${k}}`, String(params[k]));
      });
    }
    return str;
  };
  return { t, locale };
}
