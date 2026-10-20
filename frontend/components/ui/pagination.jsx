"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

const PaginationLink = ({ className, isActive, size = "icon", ...props }) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "default" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const paginationCopy = {
  en: {
    previous: "Previous",
    next: "Next",
    morePages: "More pages",
    previousAria: "Go to previous page",
    nextAria: "Go to next page",
  },
  ar: {
    previous: "السابق",
    next: "التالي",
    morePages: "صفحات أخرى",
    previousAria: "الذهاب إلى الصفحة السابقة",
    nextAria: "الذهاب إلى الصفحة التالية",
  },
};

const PaginationPrevious = ({ className, ...props }) => {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const text = paginationCopy[locale] || paginationCopy.en;

  return (
    <PaginationLink
      aria-label={text.previousAria}
      size="default"
      className={cn("gap-1", isArabic ? "pr-2.5" : "pl-2.5", className)}
      {...props}
    >
      {isArabic ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
      <span>{text.previous}</span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }) => {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const text = paginationCopy[locale] || paginationCopy.en;

  return (
    <PaginationLink
      aria-label={text.nextAria}
      size="default"
      className={cn("gap-1", isArabic ? "pl-2.5" : "pr-2.5", className)}
      {...props}
    >
      <span>{text.next}</span>
      {isArabic ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </PaginationLink>
  );
};
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }) => {
  const { locale } = useTranslations();
  const text = paginationCopy[locale] || paginationCopy.en;

  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{text.morePages}</span>
    </span>
  );
};
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
