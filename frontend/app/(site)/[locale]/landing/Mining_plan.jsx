"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Power, CheckCircle2, ChevronRight, DollarSign, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const SCOOTER_MODELS = [
  {
    id: "e1",
    name: "E1",
    badge: "City Commuter",
    price: 50,
    devices: 1,
    scooterIncome: 1.5,
    dailyIncome: 1.5,
    monthlyIncome: 45,
    isPopular: false,
  },
  {
    id: "e2",
    name: "E2 Pro",
    badge: "Dual Drive Pro",
    price: 220,
    devices: 4,
    scooterIncome: 1.6,
    dailyIncome: 6.4,
    monthlyIncome: 192,
    isPopular: true,
  },
  {
    id: "e3",
    name: "E3 Turbo",
    badge: "Turbo Express",
    price: 500,
    devices: 8,
    scooterIncome: 2.5,
    dailyIncome: 20.0,
    monthlyIncome: 600,
    isPopular: false,
  },
  {
    id: "e4",
    name: "E4 Fleet",
    badge: "Fleet Master",
    price: 1000,
    devices: 15,
    scooterIncome: 3.2,
    dailyIncome: 48.0,
    monthlyIncome: 1440,
    isPopular: false,
  },
  {
    id: "e5",
    name: "E5 Ultra",
    badge: "Urban Beast",
    price: 2000,
    devices: 25,
    scooterIncome: 4.2,
    dailyIncome: 105.0,
    monthlyIncome: 3150,
    isPopular: false,
  },
  {
    id: "e6",
    name: "E6 Sovereign",
    badge: "Presidential Fleet",
    price: 5000,
    devices: 50,
    scooterIncome: 5.5,
    dailyIncome: 275.0,
    monthlyIncome: 8250,
    isPopular: false,
  },
];

export default function Mining_plan() {
  const { locale } = useTranslations();
  const { canAccessUserDashboard } = useAuth();
  const isAr = locale === "ar";
  const base = `/${locale}`;

  const [selectedIdx, setSelectedIdx] = useState(1); // default E2
  const currentModel = SCOOTER_MODELS[selectedIdx] || SCOOTER_MODELS[1];

  return (
    <section id="scooter-plans" className="w-full py-16 sm:py-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[500px] w-[90%] max-w-[900px] rounded-full bg-gradient-to-tr from-blue-600/10 via-cyan-500/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? "أسطول طاقة السكوترات (E1 إلى E6)" : "Smart E-Scooter Fleet Models"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {isAr
              ? "اختر طراز السكوتر المناسب وابدأ الكسب"
              : "Select Your E-Scooter Model & Start Earning"}
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            {isAr
              ? "كل طراز مجهز بنظام تحكم ذكي وزر تشغيل (⏻) وعد تنازلي، مع عوائد يومية فورية بالـ USDT."
              : "Every model is equipped with telematics, Power button (⏻), real-time countdown, and instant daily USDT yields."}
          </p>
        </div>

        {/* 6 Scooter Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SCOOTER_MODELS.map((scooter, idx) => {
            const isSelected = idx === selectedIdx;

            return (
              <motion.div
                key={scooter.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => setSelectedIdx(idx)}
                className={`relative overflow-hidden rounded-3xl p-6 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 shadow-2xl border ${
                  isSelected
                    ? "bg-slate-900/95 border-cyan-400 shadow-cyan-950/60 -translate-y-1"
                    : "bg-slate-900/75 border-slate-700/60 hover:border-slate-600 hover:-translate-y-0.5"
                }`}
              >
                {scooter.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-400 to-blue-600 text-slate-950 font-black text-[10px] uppercase px-4 py-1 rounded-bl-xl shadow-lg">
                    {isAr ? "الأكثر طلباً" : "Popular"}
                  </div>
                )}

                {/* Model Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-wide">
                      {scooter.name}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {scooter.badge}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-cyan-400 font-mono">
                      ${scooter.price}{" "}
                      <span className="text-xs text-slate-400 font-normal">USDT</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {isAr ? "سعر التأجير" : "Lease Price"}
                    </span>
                  </div>
                </div>

                {/* Scooter Cutout Graphic */}
                <div className="py-2 flex items-center justify-center">
                  <img
                    src="/scooter_transparent.png"
                    alt={scooter.name}
                    className="w-44 h-44 object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.6)] transform hover:scale-105 transition-transform"
                  />
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-3">
                  <div className="p-2.5 rounded-2xl bg-slate-800/50 border border-slate-700/40 text-center">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      {isAr ? "عدد الأجهزة" : "Devices"}
                    </span>
                    <span className="font-extrabold text-white text-sm">
                      {scooter.devices} {isAr ? "أجهزة" : "Units"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-800/50 border border-slate-700/40 text-center">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      {isAr ? "الدخل اليومي" : "Daily Income"}
                    </span>
                    <span className="font-extrabold text-cyan-400 text-sm">
                      +{scooter.dailyIncome} USDT
                    </span>
                  </div>
                </div>

                {/* Direct Action Button */}
                <Link
                  href={
                    canAccessUserDashboard
                      ? `${base}/user_dashboard/mining_plans`
                      : `${base}/user_auth/signup`
                  }
                  className="block pt-1"
                >
                  <Button
                    className={`w-full py-5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-lg ${
                      isSelected
                        ? "bg-[#0c2a54] hover:bg-[#103569] text-white border border-blue-500/50 shadow-blue-950/60"
                        : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700"
                    }`}
                  >
                    <Power className="w-4 h-4 mr-1 text-cyan-300" />
                    <span>{isAr ? `استئجار سكوتر ${scooter.name}` : `Lease ${scooter.name}`}</span>
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Live Interactive Earnings Simulator Box */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "محاكي الأرباح اللحظي" : "Live Earnings Simulator"}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {isAr
                  ? `أرباحك التقديرية مع طراز ${currentModel.name}`
                  : `Estimated Profits with ${currentModel.name}`}
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {isAr
                  ? `عند استئجار طراز ${currentModel.name} بقيمة $${currentModel.price}، ستحصل على ${currentModel.devices} أجهزة سكوتر تولد لك دخلاً يومياً بقيمة ${currentModel.dailyIncome} USDT يضاف لمحفظتك مع كل دورة تشغيل.`
                  : `Leasing ${currentModel.name} for $${currentModel.price} unlocks ${currentModel.devices} active e-scooters generating ${currentModel.dailyIncome} USDT every daily cycle.`}
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isAr ? "الدخل اليومي" : "Daily Income"}
                </span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                  +${currentModel.dailyIncome}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">USDT / يوم</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isAr ? "الدخل الشهري (30 يوم)" : "Monthly (30 Days)"}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  +${currentModel.monthlyIncome}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">USDT / شهر</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isAr ? "مكافأة الإحالة الإضافية" : "Referral Bonus"}
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  +$100
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">لكل 10 أعضاء</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
