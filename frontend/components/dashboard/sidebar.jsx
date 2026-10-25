"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearUserSession } from "@/api/instance";
import {
  LayoutGrid,
  Cpu,
  Users,
  ShoppingCart,
  Ticket,
  DollarSign,
  ArrowLeftRight,
  Bell,
  Settings,
  ShieldCheck,
  BarChart3,
  Wallet,
  Headphones,
  UserPlus,
  TrendingUp,
  LogOut,
  Car,
  Zap,
} from "lucide-react";

export default function DashboardSidebar({ asDrawer = false }) {
  const { t, locale } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  const base = `/${locale}/user_dashboard`;
  const isRTL = locale === "ar";

  const items = [
    { key: "overview", label: isRTL ? "الرئيسية" : "Home", href: base, icon: LayoutGrid },
    { key: "tasks", label: isRTL ? "RIDE (تشغيل السكوتر)" : "RIDE Console", href: `${base}/tasks`, icon: Zap },
    { key: "mining_plans", label: isRTL ? "طاقة (تأجير السكوتر)" : "Energy (Scooters)", href: `${base}/mining_plans`, icon: Car },
    { key: "profile", label: isRTL ? "حسابي (الملف الشخصي)" : "My Account", href: `${base}/profile`, icon: ShieldCheck },
    { key: "referral", label: isRTL ? "دعوة (مكافأة 100$)" : "Invite ($100 Reward)", href: `${base}/Referral`, icon: UserPlus },
    { key: "deposit", label: isRTL ? "شحن المحفظة" : "Deposit USDT", href: `${base}/deposit`, icon: Wallet },
    { key: "withdraw", label: isRTL ? "سحب الأرباح" : "Withdraw", href: `${base}/Withdraw`, icon: ArrowLeftRight },
    { key: "transactions", label: isRTL ? "سجل العمليات" : "Transactions", href: `${base}/Transactions`, icon: ShoppingCart },
    { key: "support", label: isRTL ? "خدمة العملاء" : "Customer Support", href: `/${locale}/support`, icon: Headphones },
  ];

  const containerClass = asDrawer
    ? "h-full bg-card text-white flex flex-col w-64 rounded-none"
    : "hidden md:flex h-screen sticky top-0 border border-gray-400/40 bg-sidebar text-white flex-col w-64 rounded-none";

  const handleLogout = () => {
    clearUserSession();
    router.replace(`/${locale}/`);
  };

  return (
    <Card className={containerClass}>
      <div className="w-full h-18  grid place-items-center ">
        <Link href={`/${locale}`} className="block mx-auto">
          <Image
            src="/logo.svg"
            alt="logo"
            width={150}
            height={8}
            className="mx-auto w-fit h-8 object-contain"
          />
        </Link>
      </div>

      <nav className="mt-2 flex-1 px-2 md:px-3 space-y-1">
        {items.map(({ key, href, icon: Icon, badge }, index) => {
          const isOverview = key === "overview";
          const active = isOverview
            ? pathname === href
            : pathname === href ||
              (pathname && pathname.startsWith(href + "/"));
          const hasTopDivider = index === items.length - 3;
          return (
            <Button
              asChild
              key={key}
              variant="ghost"
              className={`relative w-full justify-between overflow-hidden !rounded-none  px-2 md:px-3 py-3 transition-all duration-300 ${
                hasTopDivider ? "mt-3 border-t border-white/20 pt-5" : ""
              } ${
                active
                  ? " text-primary"
                  : "text-white/75 hover:text-primary hover:bg-white/[0.03]"
              }`}
            >
              <Link href={href}>
                {active ? (
                  <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-primary" />
                ) : null}
                <div className="flex items-center gap-3">
                  {key === "transactions" ? (
                    <Image
                      src="/coin.svg"
                      alt=""
                      aria-hidden="true"
                      width={17}
                      height={17}
                      className={`h-[17px] w-[17px] object-contain ${
                        active ? "opacity-100" : "opacity-70"
                      }`}
                    />
                  ) : (
                    <Icon
                      className={active ? "text-primary" : "text-white/70"}
                      size={17}
                    />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      asDrawer ? "inline" : "hidden md:inline"
                    } ${active ? "text-primary" : "text-white/75"}`}
                  >
                    {item.label || (key === "my_plans"
                      ? locale === "ar"
                        ? "خططي"
                        : "My Plans"
                      : t(`sidebar.items.${key}`))}
                  </span>
                </div>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="border-t border-gray-400/40 px-2 py-2 md:px-3">
        <button
          type="button"
          onClick={handleLogout}
          className="relative flex w-full items-center gap-3 overflow-hidden px-2 py-3 text-sm font-medium text-white/75 transition-all duration-300 hover:bg-white/[0.03] hover:text-primary md:px-3"
        >
          <LogOut className="h-[17px] w-[17px] text-white/70" />
          <span className={asDrawer ? "inline" : "hidden md:inline"}>
            {t("sidebar.logout")}
          </span>
        </button>
      </div>

      <div className="px-3 py-3 md:hidden border-t border-gray-400/40 w-fit">
        <LanguageSwitcher />
      </div>
    </Card>
  );
}
