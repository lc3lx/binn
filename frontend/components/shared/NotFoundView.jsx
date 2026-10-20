"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import SupportButton from "@/components/site/SupportButton";

function getLocaleFromPath(pathname) {
  const maybeLocale = pathname.split("/")[1];
  return maybeLocale === "ar" || maybeLocale === "en" ? maybeLocale : "en";
}

function replaceLocaleInPath(pathname, nextLocale) {
  const segments = pathname.split("/");

  if (segments[1] === "ar" || segments[1] === "en") {
    segments[1] = nextLocale;
    return segments.join("/");
  }

  return `/${nextLocale}`;
}

export default function NotFoundView({
  title = "Page Not Found",
  description = "The page you are looking for doesn't exist or any other error occurred, go back to home page.",
  primaryLabel = "Get the course",
  primaryHref,
  homeLabel = "Go Home",
  homeHref,
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname || "/");
  // const resolvedPrimaryHref = primaryHref || `/${locale}#plan`;
  // const resolvedHomeHref = homeHref || `/${locale}`;
  const englishHref = replaceLocaleInPath(pathname || `/${locale}`, "en");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d0d0e] px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,209,0,0.07),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <span className="text-[92px] font-bold leading-none tracking-tight text-white sm:text-[120px]">
          404
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/55 sm:text-base">
          {description}
        </p>
      </div>

      <SupportButton className="fixed bottom-6 z-40 ltr:right-6 rtl:left-6" />
    </div>
  );
}
