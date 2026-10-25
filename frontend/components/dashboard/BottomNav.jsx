"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { Home, ListOrdered, Share2, User } from "lucide-react";

// Crisp custom line-art scooter icon matching the screenshot
function ScooterIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Front Wheel */}
      <circle cx="6" cy="21" r="3" />
      {/* Back Wheel */}
      <circle cx="22" cy="21" r="3" />
      {/* Base Deck */}
      <path d="M9 21h10" />
      {/* Stem from back wheel/deck to handlebar */}
      <path d="M19 18l-5-13" />
      {/* Handlebar */}
      <path d="M12 5h5" />
    </svg>
  );
}

export default function BottomNav() {
  const { locale } = useTranslations();
  const pathname = usePathname();
  const isArabic = locale === "ar";
  const base = `/${locale}/user_dashboard`;

  // Standard tab order: Home, Energy (طاقة), RIDE, Invite (دعوة), Mine (حسابي)
  // When in RTL, CSS flex-row or flex-row-reverse naturally presents it correctly.
  const tabs = [
    {
      id: "home",
      label: isArabic ? "الرئيسية" : "Home",
      href: base,
      icon: Home,
      exact: true,
    },
    {
      id: "energy",
      label: isArabic ? "طاقة" : "Energy",
      href: `${base}/mining_plans`,
      icon: ListOrdered,
    },
    {
      id: "ride",
      label: "RIDE",
      href: `${base}/tasks`,
      icon: ScooterIcon,
      isCenter: true,
    },
    {
      id: "invite",
      label: isArabic ? "دعوة" : "Invite",
      href: `${base}/Referral`,
      icon: Share2,
    },
    {
      id: "profile",
      label: isArabic ? "حسابي" : "Mine",
      href: `${base}/profile`,
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[#091120]/95 border-t border-slate-800/90 backdrop-blur-2xl px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + "/");

          if (tab.isCenter) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative -top-2 flex flex-col items-center group transition-transform active:scale-95"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40 border border-cyan-300"
                      : "bg-slate-800/90 text-cyan-400 border border-slate-700/80 shadow-md hover:bg-slate-700/80"
                  }`}
                >
                  <tab.icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[10px] font-extrabold tracking-wider mt-1 ${
                    isActive ? "text-cyan-400 font-black" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <tab.icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? "text-blue-400" : "text-slate-400"
                }`}
              />
              <span className="text-[10px] mt-1 font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
