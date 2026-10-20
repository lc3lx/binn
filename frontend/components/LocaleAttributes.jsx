"use client";

import { useEffect } from "react";

export default function LocaleAttributes({ locale }) {
  useEffect(() => {
    const resolvedLocale = locale === "ar" ? "ar" : "en";
    const dir = resolvedLocale === "ar" ? "rtl" : "ltr";

    document.documentElement.lang = resolvedLocale;
    document.documentElement.dir = dir;
    document.documentElement.setAttribute("data-locale", resolvedLocale);
  }, [locale]);

  return null;
}
