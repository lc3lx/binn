"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Power,
  ChevronRight,
  ShieldCheck,
  Award,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function Hero() {
  const { t, locale } = useTranslations();
  const { canAccessUserDashboard } = useAuth();
  const isAr = locale === "ar";
  const base = `/${locale}`;

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden pt-24 sm:pt-28 pb-16 flex items-center justify-center">
      {/* Background Cyber Glowing Accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text / Info Column (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`lg:col-span-7 space-y-6 ${isAr ? "text-right" : "text-left"}`}
          >
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950/40 backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span>
                {isAr
                  ? "⚡ الجيل الجديد من التنقل الكهربائي والاستثمار اليومي"
                  : "⚡ Next-Gen Smart E-Scooter Mobility & Daily Income"}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400">
                ETG RIDE
              </span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-200 mt-2 block">
                {isAr
                  ? "استأجر سكوترك الكهربائي، شغّل رحلتك، واكسب USDT يومياً"
                  : "Lease your smart e-scooter, power your ride, and earn USDT daily"}
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {isAr
                ? "منصة متطورة لتشغيل واستثمار أساطيل السكوترات الكهربائية الذكية (E1 إلى E6). تفعيل الرحلة بنقرة واحدة عبر زر الطاقة (⏻)، عد تنازلي ذكي، أرباح يومية مؤكدة، وسحب فوري BEP-20 مع مكافأة 100$ لكل 10 إحالات مفعلة."
                : "Advanced smart micro-mobility investment platform. Power rides with one-click (⏻), track real-time countdowns, collect daily USDT profits, and enjoy instant BEP-20 payouts with $100 referral rewards."}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href={
                  canAccessUserDashboard
                    ? `${base}/user_dashboard/tasks`
                    : `${base}/user_auth/signup`
                }
              >
                <Button className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-base shadow-xl shadow-blue-900/40 border border-cyan-400/40 transition-all active:scale-95">
                  <Power className="w-5 h-5 mr-2 text-cyan-200" />
                  <span>
                    {isAr ? "ابدأ تشغيل السكوتر (RIDE)" : "Start Ride Console (RIDE)"}
                  </span>
                </Button>
              </Link>

              <a href="#scooter-plans">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 rounded-2xl border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-white font-bold text-base transition-all"
                >
                  <Zap className="w-4 h-4 mr-2 text-cyan-400" />
                  <span>
                    {isAr ? "تصفح أسطول السكوترات (طاقة)" : "Explore Scooters (Energy)"}
                  </span>
                </Button>
              </a>
            </div>

            {/* Live Platform Mini Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {isAr ? "الرحلات المكتملة" : "Dispatched Rides"}
                </span>
                <span className="text-lg font-black text-white font-mono">
                  348,200+
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {isAr ? "طرازات السكوتر" : "Scooter Fleet"}
                </span>
                <span className="text-lg font-black text-cyan-400 font-mono">
                  E1 - E6
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {isAr ? "مكافأة الإحالة" : "Referral Bonus"}
                </span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  $100 / 10
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {isAr ? "سرعة السحب" : "Withdrawal Speed"}
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {isAr ? "فوري BEP-20" : "Instant"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Showcase Column (5 cols) - Features Real Scooter Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 relative flex items-center justify-center py-6"
          >
            {/* Glowing Backdrop Circle */}
            <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-br from-blue-600/25 via-cyan-500/20 to-transparent blur-3xl pointer-events-none" />

            {/* Central Scooter Card */}
            <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-6 shadow-2xl space-y-4">
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">
                    {isAr ? "طراز السكوتر الأكثر شعبية" : "Most Popular Model"}
                  </span>
                  <h3 className="text-2xl font-black text-white">E3 Pro Scooter</h3>
                </div>

                <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isAr ? "حالة: بنشاط" : "Active"}</span>
                </div>
              </div>

              {/* Scooter Cutout Image */}
              <div className="relative py-2 flex items-center justify-center">
                <img
                  src="/scooter_transparent.png"
                  alt="ETG Electric Scooter"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transform hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Specs pill badges */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block mb-0.5">
                    {isAr ? "عدد الأجهزة" : "Devices"}
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    {isAr ? "4 أجهزة" : "4 Devices"}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block mb-0.5">
                    {isAr ? "الدخل اليومي" : "Daily Income"}
                  </span>
                  <span className="text-sm font-extrabold text-cyan-400">
                    10.00 USDT
                  </span>
                </div>
              </div>

              {/* Simulated active countdown bar */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {isAr ? "العد التنازلي للرحلة:" : "Cycle Countdown:"}
                </span>
                <span className="font-mono text-cyan-400 font-bold tracking-wider text-sm">
                  04:59:50
                </span>
              </div>

              {/* Direct CTA inside card */}
              <Link
                href={
                  canAccessUserDashboard
                    ? `${base}/user_dashboard/tasks`
                    : `${base}/user_auth/signup`
                }
                className="block"
              >
                <Button className="w-full py-5 rounded-2xl bg-[#0c2a54] hover:bg-[#103569] text-white font-extrabold text-xs sm:text-sm border border-blue-500/40 shadow-lg shadow-blue-950/60">
                  <Power className="w-4 h-4 mr-1 text-cyan-300" />
                  <span>{isAr ? "تشغيل السكوتر الآن (⏻)" : "Power On Scooter (⏻)"}</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
