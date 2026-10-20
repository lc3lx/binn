"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "../hooks/useTranslations";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/components/auth/AuthProvider";
import { Menu, X, DollarSign, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { logout } from "@/api/instance";

function Navbar() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { canAccessUserDashboard } = useAuth();

  const currentLocale = pathname.split("/")[1];
  const isArabic = currentLocale === "ar";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [pendingSection, setPendingSection] = useState(null);
  const links = [
    { path: `/${currentLocale}#stats`, label: t("nav.stats") },
    { path: `/${currentLocale}#plan`, label: t("nav.plan") },
    { path: `/${currentLocale}#how-it-works`, label: t("nav.howItWorks") },
  ];

  if (canAccessUserDashboard) {
    links.push({
      path: `/${currentLocale}/user_dashboard`,
      label: t("nav.dashboard"),
    });
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  const handleSectionClick = (hash) => {
    const el =
      typeof document !== "undefined" ? document.getElementById(hash) : null;
    if (!el) return;
    const offset = 80;
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    setPendingSection(hash);
    setActiveSection(hash);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleStartNow = () => {
    const homePath = `/${currentLocale}`;
    if (pathname === homePath || pathname === `${homePath}/`) {
      handleSectionClick("plan");
      return;
    }
    router.push(`${homePath}#plan`);
  };

  const handleWithdraw = () => {
    router.push(`/${currentLocale}/user_dashboard/Withdraw`);
  };

  const handleLogout = () => {
    logout(currentLocale);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ids = ["plan", "stats", "how-it-works"];
    const els = ids
      .map((id) =>
        typeof document !== "undefined" ? document.getElementById(id) : null,
      )
      .filter(Boolean);
    if (els.length === 0) return;

    const firstSection = els[0];
    const resetActiveSection = () => {
      const resetPoint = Math.max(firstSection.offsetTop - 160, 0);
      if (window.scrollY < resetPoint) {
        setActiveSection(null);
        setPendingSection(null);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
          setPendingSection(null);
        }
      },
      { rootMargin: "-90px 0px -35% 0px", threshold: 0.22 },
    );

    window.addEventListener("scroll", resetActiveSection, { passive: true });
    resetActiveSection();

    els.forEach((el) => observer.observe(el));
    return () => {
      window.removeEventListener("scroll", resetActiveSection);
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 overflow-hidden z-50 sm:pt-5 transition-colors duration-300 ${
        isScrolled ? "bg-card" : "bg-card md:!bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 flex h-16 items-center justify-between gap-3 lg:gap-6">
          {/* Left side - Logo */}
          <div className="flex shrink-0 items-center">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={176}
                height={176}
                className="h-28 w-28 sm:h-36 sm:w-36 lg:h-44 lg:w-44"
              />
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
            {links.map((link) => {
              const isDashboard = link.path.includes("/user_dashboard");
              const hash = link.path.split("#")[1];
              const isActive = isDashboard
                ? pathname.includes("/user_dashboard")
                : (pendingSection ?? activeSection) === hash;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    if (!isDashboard && hash) {
                      e.preventDefault();
                      handleSectionClick(hash);
                    }
                  }}
                  className={`rounded-md px-2 py-2 text-sm font-medium transition-all duration-300 xl:px-3 ${
                    isActive
                      ? "text-primary "
                      : "text-white hover:text-primary "
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side - Buttons and Language Switch */}
          <div className="hidden items-center gap-2 md:flex lg:gap-3">
            <Button
              className="px-3 md:h-9 md:text-sm lg:px-4"
              onClick={handleStartNow}
            >
              {t("nav.startNow")}
            </Button>

            {canAccessUserDashboard && (
              <>
                <div className="hidden h-8 border-l border-gray-300 lg:mx-2 lg:block"></div>
                <Button
                  variant="ghost"
                  className="px-3 md:h-9 md:text-sm lg:px-4 text-white hover:text-primary"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              </>
            )}

            <div className="hidden h-8 border-l border-gray-300 lg:mx-2 lg:block"></div>
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Tablet / Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />

            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>

          <div className="hidden items-center gap-2 md:flex lg:hidden">
            <LanguageSwitcher />
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-2 text-white transition-colors hover:border-primary/40 hover:text-primary"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link) => {
                const isDashboard = link.path.includes("/user_dashboard");
                const hash = link.path.split("#")[1];
                const isActive = isDashboard
                  ? pathname.includes("/user_dashboard")
                  : (pendingSection ?? activeSection) === hash;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={(e) => {
                      if (!isDashboard && hash) {
                        e.preventDefault();
                        handleSectionClick(hash);
                        closeMobileMenu();
                      } else {
                        closeMobileMenu();
                      }
                    }}
                    className={`block rounded-md px-3 py-2 text-base font-medium transition-all duration-300 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-white hover:text-primary hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-gray-100/40 pt-4">
                <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="flex flex-col space-y-2 md:w-full md:flex-row md:items-center md:gap-2 md:space-y-0">
                    <Button className="md:flex-1" onClick={handleStartNow}>
                      {t("nav.startNow")}
                    </Button>
                    {canAccessUserDashboard ? (
                      <button
                        onClick={handleWithdraw}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2 text-primary md:flex-1"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>{t("nav.withdraw")}</span>
                      </button>
                    ) : null}
                    {canAccessUserDashboard ? (
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-red-500 hover:bg-red-500/10 md:flex-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("nav.logout")}</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
