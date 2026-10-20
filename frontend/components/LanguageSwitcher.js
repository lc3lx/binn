"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

const LanguageSwitcher = ({ className = "" }) => {
  const pathname = usePathname();

  // Determine current locale
  const pathSegments = pathname?.split("/").filter((segment) => segment) || [];
  const currentLocale = pathSegments[0] || "en";

  // Get the path without the locale prefix
  let pathWithoutLocale = "/";
  if (pathSegments.length > 1) {
    pathWithoutLocale = "/" + pathSegments.slice(1).join("/");
  }

  // Available languages
  const languages = {
    en: { name: "EN" },
    ar: { name: "AR" },
  };

  // Get the other locale
  const otherLocale = currentLocale === "en" ? "ar" : "en";

  return (
    <div
      className={`relative rounded-full border shadow-sm transition-colors bg-[#0b0e11] text-white border-gray-800 hover:border-primary ${className}`}
    >
      <Link
        href={`/${otherLocale}${pathWithoutLocale}`}
        className="flex items-center sm:gap-2 gap-1 p-1 sm:px-3 sm:py-2 text-sm font-medium"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs sm:text-md font-semibold">
          {languages[otherLocale].name}
        </span>
      </Link>
    </div>
  );
};

export default LanguageSwitcher;
