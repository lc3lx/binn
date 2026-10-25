"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActivePlansQuery } from "@/api/services/user/plans/plans.query";
import {
  PAYOUT_INTERVAL_DAYS,
  PAYOUT_PERCENT,
  computePeriodProfit,
  countPayouts,
} from "@/lib/mining-payout";
import { Coins, Zap, TrendingUp, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

// Default ETG Ride Electric Scooter plans fallback
const DEFAULT_PLANS = [
  {
    _id: "plan-1",
    name: "E1",
    modelName: "E1",
    price: 50,
    dailyIncome: 1.5,
    deviceCount: 1,
    scooterIncome: 1.5,
    dailyTasks: 1,
    durationDays: 30,
    roiMinPercent: 3,
    roiMaxPercent: 3,
    isPopular: false,
    vehicleImage: "/scooter_transparent.png",
  },
  {
    _id: "plan-2",
    name: "E2",
    modelName: "E2",
    price: 220,
    dailyIncome: 6.4,
    deviceCount: 4,
    scooterIncome: 1.6,
    dailyTasks: 4,
    durationDays: 30,
    roiMinPercent: 2.91,
    roiMaxPercent: 2.91,
    isPopular: true,
    vehicleImage: "/scooter_transparent.png",
  },
  {
    _id: "plan-3",
    name: "E3",
    modelName: "E3",
    price: 500,
    dailyIncome: 20.0,
    deviceCount: 8,
    scooterIncome: 2.5,
    dailyTasks: 8,
    durationDays: 30,
    roiMinPercent: 4.0,
    roiMaxPercent: 4.0,
    isPopular: false,
    vehicleImage: "/scooter_transparent.png",
  },
  {
    _id: "plan-4",
    name: "E4",
    modelName: "E4",
    price: 1000,
    dailyIncome: 48.0,
    deviceCount: 15,
    scooterIncome: 3.2,
    dailyTasks: 15,
    durationDays: 45,
    roiMinPercent: 4.8,
    roiMaxPercent: 4.8,
    isPopular: false,
    vehicleImage: "/scooter_transparent.png",
  },
  {
    _id: "plan-5",
    name: "E5",
    modelName: "E5",
    price: 2000,
    dailyIncome: 105.0,
    deviceCount: 25,
    scooterIncome: 4.2,
    dailyTasks: 25,
    durationDays: 60,
    roiMinPercent: 5.25,
    roiMaxPercent: 5.25,
    isPopular: false,
    vehicleImage: "/scooter_transparent.png",
  },
  {
    _id: "plan-6",
    name: "E6",
    modelName: "E6",
    price: 5000,
    dailyIncome: 275.0,
    deviceCount: 50,
    scooterIncome: 5.5,
    dailyTasks: 50,
    durationDays: 90,
    roiMinPercent: 5.5,
    roiMaxPercent: 5.5,
    isPopular: false,
    vehicleImage: "/scooter_transparent.png",
  },
];

export default function Mining_plan() {
  const { locale } = useTranslations();
  const isAr = locale === "ar";
  const { canAccessUserDashboard } = useAuth();
  const { data: plansResponse } = useActivePlansQuery({ activeOnly: true });

  const plans = useMemo(() => {
    const list = Array.isArray(plansResponse?.data)
      ? plansResponse.data
      : Array.isArray(plansResponse)
        ? plansResponse
        : [];
    return list.length > 0 ? list : DEFAULT_PLANS;
  }, [plansResponse]);

  // Selected plan index (default to Standard Miner - index 1 if available)
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(() => {
    const popularIdx = DEFAULT_PLANS.findIndex((p) => p.isPopular);
    return popularIdx >= 0 ? popularIdx : 0;
  });

  const selectedPlan = plans[selectedPlanIndex] || plans[0] || DEFAULT_PLANS[0];

  // Duration in days
  const planMaxDays = Math.max(1, Number(selectedPlan.durationDays) || 30);
  const [selectedDays, setSelectedDays] = useState(planMaxDays);

  // Investment amount
  const [amount, setAmount] = useState(String(selectedPlan.price || 100));

  // Switch plan handler
  const handleSelectPlan = (idx) => {
    setSelectedPlanIndex(idx);
    const plan = plans[idx] || DEFAULT_PLANS[0];
    setAmount(String(plan.price || 100));
    setSelectedDays(Math.max(1, Number(plan.durationDays) || 30));
  };

  // Profit calculation logic matching backend exactly:
  // every PAYOUT_INTERVAL_DAYS the user earns PAYOUT_PERCENT of the amount
  const numericAmount = Math.max(0, Number(amount) || 0);

  // Profit credited on each payout
  const payoutProfit = computePeriodProfit(numericAmount);

  // Profit in selected days (only completed payout periods count)
  const periodProfit = payoutProfit * countPayouts(selectedDays);

  // Full plan duration net profit
  const totalNetProfit = payoutProfit * countPayouts(planMaxDays);
  const totalRoiPercent = PAYOUT_PERCENT * countPayouts(planMaxDays);

  // Total return (Capital + Net Profit)
  const totalReturn = numericAmount + totalNetProfit;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <section id="plan" dir={isAr ? "rtl" : "ltr"} className="relative w-full py-16 px-4 sm:px-6 lg:px-8">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[450px] w-[90%] max-w-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(240,185,11,0.08)_0%,transparent_70%)] blur-2xl" />
      </div>

      <div className="mx-auto w-full max-w-5xl">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isAr ? "حاسبة الأرباح التقديرية الحية" : "Live Mining Yield Calculator"}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            {isAr ? "احسب أرباحك من التعدين السحابي" : "Calculate Your Cloud Mining Profits"}
          </h2>
          <p className="mt-3 text-sm text-gray-400 max-w-2xl mx-auto">
            {isAr
              ? `اختر خطة التعدين المناسبة أو حدد المبلغ والمدة لترى أرباحك كل ${PAYOUT_INTERVAL_DAYS} أيام والصافية فوراً دون الحاجة لتسجيل دخول.`
              : `Choose your preferred mining tier or customize your amount to see your payout every ${PAYOUT_INTERVAL_DAYS} days and total net ROI instantly.`}
          </p>
        </div>

        {/* Plan Selection Buttons */}
        <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
          {plans.map((p, idx) => {
            const isSelected = idx === selectedPlanIndex;
            return (
              <button
                key={p._id || idx}
                type="button"
                onClick={() => handleSelectPlan(idx)}
                className={`relative flex flex-col items-center justify-center rounded-xl p-3.5 sm:p-4 text-center transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? "border-primary bg-primary/15 shadow-[0_0_25px_rgba(240,185,11,0.25)]"
                    : "border-white/10 bg-[#121316]/80 hover:border-white/20 hover:bg-[#1a1c22]"
                }`}
              >
                {p.isPopular && (
                  <span className="absolute -top-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider shadow">
                    {isAr ? "الأكثر طلباً" : "Popular"}
                  </span>
                )}
                <span className={`text-xs font-medium ${isSelected ? "text-primary" : "text-gray-300"}`}>
                  {p.name}
                </span>
                <span className="mt-1 text-lg font-bold text-white">
                  ${p.price} <span className="text-[11px] font-normal text-gray-400">USDT</span>
                </span>
                <span className="mt-0.5 text-[11px] text-primary/90 font-semibold">
                  {PAYOUT_PERCENT}% {isAr ? `كل ${PAYOUT_INTERVAL_DAYS} أيام` : `every ${PAYOUT_INTERVAL_DAYS} days`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Calculator Card */}
        <Card className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#181a20] to-[#0e1014] p-5 sm:p-8 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Interactive Controls */}
              <div className="space-y-6 lg:col-span-7">
                {/* Investment Amount Input */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300">
                      {isAr ? "مبلغ الاستثمار (USDT):" : "Investment Amount (USDT):"}
                    </label>
                    <span className="text-xs font-semibold text-primary">
                      {isAr ? `الحد الأدنى للخطة: $${selectedPlan.price || 50}` : `Plan Min: $${selectedPlan.price || 50}`}
                    </span>
                  </div>

                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 border-white/15 bg-black/50 text-lg font-bold text-white focus-visible:ring-primary pl-4 pr-16"
                      placeholder="100"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1.5 text-xs font-bold text-primary">
                      <span>USDT</span>
                    </div>
                  </div>

                  {/* Preset Amount Pills */}
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {[50, 100, 250, 500, 1000, 2500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(String(preset))}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                          numericAmount === preset
                            ? "bg-primary text-black font-bold"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days Slider */}
                <div className="pt-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300">
                      {isAr ? "مدة الاحتساب بالـ (أيام):" : "Calculation Duration (Days):"}
                    </label>
                    <span className="text-sm font-extrabold text-primary">
                      {selectedDays} {isAr ? "يوم" : "Days"}
                    </span>
                  </div>

                  <Slider
                    min={1}
                    max={planMaxDays}
                    step={1}
                    value={[selectedDays]}
                    onValueChange={(vals) => setSelectedDays(vals[0])}
                    className="py-3"
                  />

                  <div className="flex justify-between text-[11px] font-medium text-gray-500">
                    <span>1 {isAr ? "يوم" : "Day"}</span>
                    <span>{Math.round(planMaxDays / 2)} {isAr ? "يوم" : "Days"}</span>
                    <span>{planMaxDays} {isAr ? "يوم (المدة الكاملة)" : "Days (Full Term)"}</span>
                  </div>
                </div>

                {/* Plan Highlights */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] p-2.5 border border-white/5">
                    <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-[10px]">{isAr ? "قوة الهاش المخصصة" : "Hashrate Power"}</p>
                      <p className="font-bold text-white">{selectedPlan.hashrate || 35} {selectedPlan.hashrateUnit || "TH/s"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] p-2.5 border border-white/5">
                    <ShieldCheck className="h-4 w-4 text-green-400 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-[10px]">{isAr ? "دورية توزيع الأرباح" : "Payout Schedule"}</p>
                      <p className="font-bold text-white">
                        {isAr ? `كل ${PAYOUT_INTERVAL_DAYS} أيام آلياً` : `Auto Every ${PAYOUT_INTERVAL_DAYS} Days`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Yield Display */}
              <div className="flex flex-col justify-between rounded-xl border border-primary/20 bg-gradient-to-br from-[#1d1f26] to-[#121316] p-5 lg:col-span-5">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <span className="text-xs font-semibold text-gray-400">
                      {isAr ? "الخطة المحددة:" : "Selected Tier:"}
                    </span>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-primary" />
                      {selectedPlan.name}
                    </span>
                  </div>

                  {/* Payout Profit Box */}
                  <div className="mb-4 rounded-lg bg-black/40 p-3.5 border border-primary/25">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {isAr ? `الربح كل ${PAYOUT_INTERVAL_DAYS} أيام:` : `Profit Every ${PAYOUT_INTERVAL_DAYS} Days:`}
                      </span>
                      <span className="text-xs font-semibold text-green-400">
                        +{PAYOUT_PERCENT}% / {isAr ? `${PAYOUT_INTERVAL_DAYS} أيام` : `${PAYOUT_INTERVAL_DAYS} days`}
                      </span>
                    </div>
                    <div className="mt-1.5 text-2xl font-black text-primary">
                      {formatCurrency(payoutProfit)}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        USDT / {isAr ? `${PAYOUT_INTERVAL_DAYS} أيام` : `${PAYOUT_INTERVAL_DAYS} days`}
                      </span>
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">
                        {isAr ? `الربح خلال (${selectedDays}) يوم:` : `Profit for (${selectedDays}) Days:`}
                      </span>
                      <span className="font-bold text-green-400">+{formatCurrency(periodProfit)}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">
                        {isAr ? `صافي أرباح الخطة (${planMaxDays} يوم):` : `Term Net Profit (${planMaxDays} Days):`}
                      </span>
                      <span className="font-bold text-amber-400">+{formatCurrency(totalNetProfit)}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">
                        {isAr ? "إجمالي نسبة العائد (ROI):" : "Total ROI Yield:"}
                      </span>
                      <span className="font-bold text-white">{totalRoiPercent}%</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-sm">
                      <span className="font-bold text-white">
                        {isAr ? "إجمالي العائد مع رأس المال:" : "Total Payout (Capital + Yield):"}
                      </span>
                      <span className="text-base font-black text-primary">
                        {formatCurrency(totalReturn)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call to Action Buttons */}
                <div className="mt-6 pt-3 border-t border-white/10 space-y-2">
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-black font-extrabold text-sm h-11 cursor-pointer shadow-lg shadow-primary/20"
                  >
                    <Link
                      href={
                        canAccessUserDashboard
                          ? `/${locale}/user_dashboard/deposit`
                          : `/${locale}/user_auth/signup`
                      }
                    >
                      <TrendingUp className="h-4 w-4 mr-1.5 ml-1.5" />
                      {canAccessUserDashboard
                        ? isAr ? "إيداع والاشتراك بالخطة الآن" : "Deposit & Start Plan Now"
                        : isAr ? "ابدأ التعدين واكسب الآن" : "Start Mining & Earn Now"}
                    </Link>
                  </Button>

                  {!canAccessUserDashboard && (
                    <div className="text-center">
                      <Link
                        href={`/${locale}/user_auth/login`}
                        className="text-[11px] text-gray-400 hover:text-white underline transition"
                      >
                        {isAr ? "لديك حساب بالفعل؟ تسجيل الدخول" : "Already have an account? Sign in"}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
