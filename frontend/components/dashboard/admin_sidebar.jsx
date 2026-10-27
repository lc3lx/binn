"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearAdminSession } from "@/api/instance";
import {
  LayoutGrid,
  Zap,
  Users,
  ArrowLeftRight,
  ShieldCheck,
  BarChart3,
  Settings,
  Headphones,
  BadgeCheck,
  HelpCircle,
  UserRound,
  ShieldCog,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldIcon,
  Users2,
  LogOut,
} from "lucide-react";

export default function DashboardSidebar({ asDrawer = false }) {
  const { t, locale } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  const base = `/${locale}/dashboard-x9cBqC12`;
  const isRTL = locale === "ar";

  const items = [
    { key: "overview", href: base, icon: LayoutGrid },
    { key: "users", href: `${base}/users`, icon: Users },
    { key: "deposit", href: `${base}/deposit`, icon: ArrowDownCircle },
    { key: "withdraw", href: `${base}/Withdraw`, icon: ArrowUpCircle },

    { key: "transactions", href: `${base}/Transactions`, icon: ArrowLeftRight },
    { key: "mining_plans", href: `${base}/mining_plans`, icon: Zap },
    {
      key: "support",
      href: `${base}/admin_support`,
      icon: Headphones,
    },
    { key: "referral", href: `${base}/referral `, icon: Users2 },
    { key: "statistics", href: `${base}/Statistics`, icon: BarChart3 },

    { key: "faq", href: `${base}/faq`, icon: HelpCircle },
    {
      key: "Platform_Settings",
      href: `${base}/Platform_Settings`,
      icon: ShieldIcon,
    },

    { key: "profile", href: `${base}/profile`, icon: UserRound },
  ];

  const containerClass = asDrawer
    ? "h-full bg-sidebar text-white flex flex-col w-64 rounded-none min-h-0"
    : "hidden md:flex h-screen sticky top-0 border border-gray-400/40 bg-[var(--color-sidebar)] text-white flex-col w-64 rounded-none min-h-0 scrollbar-hide";

  const handleLogout = () => {
    clearAdminSession();
    router.replace(`/${locale}/admin_auth/login`);
  };

  return (
    <Card className={containerClass}>
      <div className="w-full h-18 grid place-items-center border-b border-gray-400/40">
        <Link href={`/${locale}`} className="block mx-auto">
          <Image
            src="/logo.svg"
            alt="logo"
            width={144}
            height={48}
            className="mx-auto w-[9rem]  object-contain"
          />
        </Link>
      </div>

      <nav className="mt-2 flex-1 px-2 md:px-3 space-y-1 overflow-y-auto min-h-0 scrollbar-hide">
        {items.map(({ key, href, icon: Icon, badge }, index) => {
          const isOverview = key === "overview";
          const active = isOverview
            ? pathname === href
            : pathname === href ||
              (pathname && pathname.startsWith(href + "/"));
          const hasTopDivider = index === items.length - 3;
          return (
            <button
              key={key}
              className={`relative text-lg w-full justify-between overflow-hidden !rounded-none px-2 md:px-3 py-3 transition-all duration-300 ${
                hasTopDivider ? "mt-3 border-t border-white/20 pt-5" : ""
              } ${
                active
                  ? "text-primary"
                  : "text-white/75 hover:bg-white/[0.03] hover:text-primary"
              }`}
            >
              <Link href={href}>
                {active ? (
                  <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-primary" />
                ) : null}
                <div className="flex items-center gap-3">
                  <Icon
                    className={active ? "text-primary" : "text-white/70"}
                    size={17}
                  />
                  <span
                    className={`text-sm font-medium ${
                      asDrawer ? "inline" : "hidden md:inline"
                    } ${active ? "text-primary" : "text-white/75"}`}
                  >
                    {t(`sidebar.items.${key}`)}
                  </span>
                </div>
              </Link>
            </button>
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
          <span>{isRTL ? "تسجيل الخروج" : "Logout"}</span>
        </button>
      </div>
      <div className="px-3 py-3 md:hidden border-t border-gray-400/40 w-fit">
        <LanguageSwitcher />
      </div>
    </Card>
  );
}
