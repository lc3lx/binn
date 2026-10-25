"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "../hooks/useTranslations";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/components/auth/AuthProvider";
import { Menu, X, Power, LogOut, Zap, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { logout } from "@/api/instance";

function Navbar() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { canAccessUserDashboard } = useAuth();

  const currentLocale = pathname.split("/")[1] || "ar";
  const isArabic = currentLocale === "ar";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const links = [
    { path: `/${currentLocale}#scooter-plans`, label: isArabic ? "أسطول السكوترات" : "Scooter Fleet" },
    { path: `/${currentLocale}#stats`, label: isArabic ? "المميزات" : "Features" },
    { path: `/${currentLocale}#how-it-works`, label: isArabic ? "كيف تعمل" : "How It Works" },
    { path: `/${currentLocale}#faq`, label: isArabic ? "الأسئلة الشائعة" : "FAQ" },
  ];

  if (canAccessUserDashboard) {
    links.push({
      path: `/${currentLocale}/user_dashboard`,
      label: isArabic ? "لوحة التحكم" : "Dashboard",
      isDashboard: true,
    });
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleStartNow = () => {
    if (canAccessUserDashboard) {
      router.push(`/${currentLocale}/user_dashboard/tasks`);
    } else {
      router.push(`/${currentLocale}/user_auth/signup`);
    }
  };

  const handleLogout = () => {
    logout(currentLocale);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#060a12]/95 border-b border-slate-800/80 backdrop-blur-2xl shadow-xl py-3"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href={`/${currentLocale}`} className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="ETG RIDE Logo"
              width={160}
              height={44}
              priority
              className="h-9 sm:h-11 w-auto"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Action & Language Switch */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            <Button
              onClick={handleStartNow}
              className="px-5 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-900/30 border border-cyan-300/30 transition-all active:scale-95"
            >
              <Power className="w-4 h-4 mr-1.5 text-cyan-200" />
              <span>{isArabic ? "تشغيل السكوتر (RIDE)" : "Start Ride (RIDE)"}</span>
            </Button>

            {canAccessUserDashboard && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />

            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-cyan-400" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 p-4 space-y-3 backdrop-blur-2xl shadow-2xl">
            <div className="flex flex-col space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={closeMobileMenu}
                  className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-200 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Button
                onClick={() => {
                  closeMobileMenu();
                  handleStartNow();
                }}
                className="w-full py-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
              >
                <Power className="w-4 h-4 mr-1 text-cyan-200" />
                <span>{isArabic ? "تشغيل السكوتر (RIDE)" : "Start Ride"}</span>
              </Button>

              {canAccessUserDashboard && (
                <Button
                  variant="outline"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-950/20 rounded-xl"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span>{isArabic ? "تسجيل الخروج" : "Log Out"}</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
