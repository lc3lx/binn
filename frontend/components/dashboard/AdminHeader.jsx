"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAnalyticsOverviewQuery } from "@/api/services/admin/statistics/analytics.query";
import { useAdminProfileQuery } from "@/api/services/admin/profile/profile.query";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import LanguageSwitcher from "../LanguageSwitcher";

const navLabels = {
  en: {
    overview: "Overview",
    users: "Users",
    kyc: "KYC",
    deposit: "Deposit",
    withdraw: "Withdraw",
    transactions: "Transactions",
    mining_plans: "Smart Scooters",
    support: "Support",
    security: "Security",
    statistics: "Statistics",
    faq: "FAQ",
    platformSettings: "Platform Settings",
    profile: "Profile",
  },
  ar: {
    overview: "نظرة عامة",
    users: "المستخدمون",
    kyc: "التوثيق",
    deposit: "الإيداع",
    withdraw: "السحب",
    transactions: "المعاملات",
    mining_plans: "طرازات السكوتر",
    support: "الدعم",
    security: "الأمان",
    statistics: "الإحصائيات",
    faq: "الأسئلة الشائعة",
    platformSettings: "إعدادات المنصة",
    profile: "الملف الشخصي",
  },
};

export default function AdminHeader({ locale = "en", onOpenSidebar }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: analyticsData } = useAnalyticsOverviewQuery();
  const { data: adminProfileResponse } = useAdminProfileQuery();
  const isArabic = locale === "ar";
  const labels = isArabic ? navLabels.ar : navLabels.en;
  const numberLocale = isArabic ? "ar-EG" : "en-US";

  const text = isArabic
    ? {
        openSidebar: "فتح الشريط الجانبي",
        balance: "الرصيد",
        platformBalance: "رصيد المنصة",
        searchPlaceholder: "ابحث عن قسم للانتقال السريع",
        searchHint: "اكتب اسم القسم ثم اضغط Enter",
        noResults: "لا توجد نتائج مطابقة",
      }
    : {
        openSidebar: "Open sidebar",
        balance: "Balance",
        platformBalance: "Platform Balance",
        searchPlaceholder: "Search a section for quick navigation",
        searchHint: "Type a section name then press Enter",
        noResults: "No matching sections",
      };

  const totalUserDeposits =
    Number(analyticsData?.data?.cards?.totalUserDeposits?.value || 0);
  const platformBalanceLabel = `$${totalUserDeposits.toLocaleString(numberLocale)}`;
  const adminProfile =
    adminProfileResponse?.data?.user ||
    adminProfileResponse?.user ||
    adminProfileResponse?.data ||
    null;
  const displayName =
    adminProfile?.name ||
    user?.name ||
    (isArabic ? "مدير النظام" : "Admin User");
  const displayEmail = adminProfile?.email || user?.email || "--";
  const initials = String(displayName)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const sections = useMemo(() => {
    const base = `/${locale}/dashboard-x9cBqC12`;
    return [
      { key: "overview", href: base, label: labels.overview },
      { key: "users", href: `${base}/users`, label: labels.users },
      { key: "kyc", href: `${base}/kyc`, label: labels.kyc },
      { key: "deposit", href: `${base}/deposit`, label: labels.deposit },
      { key: "withdraw", href: `${base}/Withdraw`, label: labels.withdraw },
      {
        key: "transactions",
        href: `${base}/Transactions`,
        label: labels.transactions,
      },
      {
        key: "mining_plans",
        href: `${base}/mining_plans`,
        label: labels.mining_plans,
      },
      { key: "support", href: `${base}/admin_support`, label: labels.support },
      { key: "security", href: `${base}/Security`, label: labels.security },
      {
        key: "statistics",
        href: `${base}/Statistics`,
        label: labels.statistics,
      },
      { key: "faq", href: `${base}/faq`, label: labels.faq },
      {
        key: "platformSettings",
        href: `${base}/Platform_Settings`,
        label: labels.platformSettings,
      },
      { key: "profile", href: `${base}/profile`, label: labels.profile },
    ];
  }, [labels, locale]);

  const [query, setQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);

  const filteredSections = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return sections;
    return sections.filter(
      (item) =>
        item.label.toLowerCase().includes(value) ||
        item.key.toLowerCase().includes(value) ||
        item.href.toLowerCase().includes(value),
    );
  }, [query, sections]);

  const navigateTo = (href) => {
    setResultsOpen(false);
    setQuery("");
    router.push(href);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;

    if (value.startsWith("/")) {
      navigateTo(value);
      return;
    }

    const exact = sections.find(
      (item) =>
        item.label.toLowerCase() === value.toLowerCase() ||
        item.key.toLowerCase() === value.toLowerCase(),
    );
    if (exact) {
      navigateTo(exact.href);
      return;
    }

    if (filteredSections[0]) {
      navigateTo(filteredSections[0].href);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-sidebar px-3 py-3 md:px-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 xl:hidden">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#2a2a2b] text-white/80 transition-colors hover:text-white md:hidden"
            aria-label={text.openSidebar}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="inline-flex h-10 flex-1 items-center gap-2 rounded-[10px] border border-primary/20 bg-[#3a341d] px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <span className="grid h-4 w-4 place-items-center text-primary">
              <TrendingUp className="h-3 w-3" />
            </span>
            <span className="truncate text-xs text-white/55">
              {text.balance}
            </span>
            <span className="truncate text-sm font-semibold leading-none text-primary">
              {platformBalanceLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-bold text-black">
              {initials || "AD"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-[430px]">
            <form onSubmit={onSearchSubmit} className="relative">
              <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 ltr:left-3.5 rtl:right-3.5" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setResultsOpen(true);
                }}
                onFocus={() => setResultsOpen(true)}
                onBlur={() => {
                  setTimeout(() => setResultsOpen(false), 120);
                }}
                placeholder={text.searchPlaceholder}
                className="text-white/40 focus-visible:ring-1 focus-visible:ring-white/10 ltr:pl-10 rtl:pr-10"
              />
            </form>

            {resultsOpen ? (
              <Card
                className={`absolute z-50 mt-2 w-full border border-white/10 bg-[#1e1f22] p-2 shadow-2xl ${
                  isArabic ? "right-0 text-right" : "left-0 text-left"
                }`}
              >
                <ScrollArea className="max-h-64 [&_[data-radix-scroll-area-scrollbar]]:hidden">
                  <div className="space-y-1">
                    {filteredSections.length ? (
                      filteredSections.map((item) => (
                        <Button
                          key={item.key}
                          type="button"
                          variant="ghost"
                          onClick={() => navigateTo(item.href)}
                          className={`h-auto w-full rounded-md px-3 py-2 text-sm text-white/85 hover:bg-white/10 ${
                            isArabic
                              ? "items-start justify-start text-right"
                              : "items-start justify-start text-left"
                          }`}
                        >
                          <span>{item.label}</span>
                        </Button>
                      ))
                    ) : (
                      <div
                        className={`px-3 py-2 text-sm text-white/45 ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {text.noResults}
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="mt-2 border-t border-white/10 px-2 pt-2 text-[11px] text-white/45">
                  {text.searchHint}
                </div>
              </Card>
            ) : null}
          </div>

          <div className="hidden flex-wrap items-center gap-4 xl:flex xl:justify-end">
            <div className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-primary/20 bg-[#3a341d] px-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <span className="grid h-4 w-4 place-items-center text-primary">
                <TrendingUp className="h-3 w-3" />
              </span>
              <span className="text-xs text-white/55">
                {text.platformBalance}
              </span>
              <span className="text-base font-semibold leading-none text-primary">
                {platformBalanceLabel}
              </span>
            </div>

            <div className="flex items-center gap-4 px-2">
              <div className="grid min-w-[48px] place-items-center rounded-full border border-white/10 px-2 py-1.5 text-sm">
                <LanguageSwitcher />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-black">
                {initials || "AD"}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold leading-none text-white">
                  {displayName}
                </div>
                <div className="mt-1 truncate text-[13px] leading-none text-white/38">
                  {displayEmail}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 xl:hidden">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-none text-white">
              {displayName}
            </div>
            <div className="mt-1 truncate text-xs leading-none text-white/38">
              {displayEmail}
            </div>
          </div>
          <div className="grid min-w-[48px] place-items-center rounded-full border border-white/10 px-2 py-1.5 text-sm">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
