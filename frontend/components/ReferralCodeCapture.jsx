"use client";

import { useEffect } from "react";

export default function ReferralCodeCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const code =
        params.get("code") ||
        params.get("ref") ||
        params.get("referralCode");

      if (code) {
        const cleanCode = String(code).trim().toUpperCase();
        localStorage.setItem("etg_referral_code", cleanCode);
        document.cookie = `etg_referral_code=${cleanCode}; path=/; max-age=2592000; SameSite=Lax`;
      }
    } catch {}
  }, []);

  return null;
}
