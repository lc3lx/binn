"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDashboardSummaryQuery } from "@/api/services/user/Statistics/statistics.query";
import { useTodayTaskStatusQuery } from "@/api/services/user/tasks/tasks.query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Zap,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Copy,
  Check,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Power,
  Globe,
} from "lucide-react";

export default function UserDashboardPage() {
  const { locale } = useTranslations();
  const { user } = useAuth();
  const isArabic = locale === "ar";
  const base = `/${locale}/user_dashboard`;

  const [copiedCode, setCopiedCode] = useState(false);

  const { data: summaryResponse } = useDashboardSummaryQuery();
  const { data: taskResponse } = useTodayTaskStatusQuery();

  const summary = summaryResponse?.data || {};
  const taskData = taskResponse?.data || {};

  const walletBalance = Number(taskData.walletBalance ?? summary.walletBalance ?? 0);
  const activeTier = taskData.activeTier || "E2";
  const dailyIncome = taskData.dailyIncome ?? 5.0;
  const totalIncome = taskData.totalIncome ?? 5.0;
  const availableToClaim = taskData.availableToClaim ?? 5.0;
  const referralCode = user?.referralCode || "AK2X5M4Y6";

  const handleCopyInviteLink = () => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const inviteUrl = `${origin}/?code=${referralCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(true);
    toast.success(isArabic ? "تم نسخ رابط الإحالة بنجاح!" : "Referral link copied!");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen pb-24 px-3 sm:px-4 pt-3 max-w-lg mx-auto space-y-4">
      {/* 1. Main Assets & Scooter Tier Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 font-extrabold text-xs uppercase tracking-wider border border-blue-500/30">
              ETG {activeTier}
            </span>
            <span className="text-xs text-slate-400">
              {isArabic ? "الأسطول النشط" : "Active Fleet"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isArabic ? "بنشاط" : "Active"}</span>
          </div>
        </div>

        {/* Balance Display */}
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold block">
            {isArabic ? "الرصيد الإجمالي المتاح" : "Total Wallet Balance"}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
              ${walletBalance.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-cyan-400">USDT</span>
          </div>
        </div>

        {/* 3 Quick Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block mb-0.5">
              {isArabic ? "إجمالي الدخل" : "Total Income"}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white">
              {totalIncome}
            </span>
          </div>

          <div className="p-2 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block mb-0.5">
              {isArabic ? "متاح للاستلام" : "Claimable"}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-cyan-400">
              {availableToClaim}
            </span>
          </div>

          <div className="p-2 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block mb-0.5">
              {isArabic ? "دخل اليوم" : "Today"}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-400">
              +{dailyIncome}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Link href={`${base}/tasks`} className="w-full">
            <Button className="w-full py-5 rounded-2xl bg-[#0c2a54] hover:bg-[#103569] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-950/60 border border-blue-500/40 transition-all active:scale-95">
              <Power className="w-4 h-4 mr-1 text-cyan-400" />
              {isArabic ? "شاشة RIDE (تشغيل)" : "RIDE Console"}
            </Button>
          </Link>

          <Link href={`${base}/my_plans`} className="w-full">
            <Button
              variant="outline"
              className="w-full py-5 rounded-2xl border-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm transition-all"
            >
              <Zap className="w-4 h-4 mr-1 text-cyan-400" />
              {isArabic ? "طاقة (تأجير سكوتر)" : "Energy (Lease)"}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Scooter Visual Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-5 shadow-2xl flex items-center justify-between">
        <div className="space-y-1 z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20 inline-block">
            {isArabic ? "طرازات السكوتر الذكي" : "Smart Scooter"}
          </span>
          <h3 className="text-lg font-black text-white">
            {isArabic ? "سكوتر كهربائي متطور E3 Pro" : "Electric Scooter E3 Pro"}
          </h3>
          <p className="text-xs text-slate-400">
            {isArabic ? "دخل يومي 10.0 USDT | 4 أجهزة" : "Daily 10.0 USDT | 4 Devices"}
          </p>

          <div className="pt-2">
            <Link
              href={`${base}/tasks`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
            >
              <span>{isArabic ? "فتح شاشة القيادة" : "Open Ride Screen"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative w-28 h-28 flex items-center justify-center">
          <img
            src="/scooter_transparent.png"
            alt="E2 Scooter"
            className="w-28 h-28 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform"
          />
        </div>
      </div>

      {/* 3. Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`${base}/deposit`}>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl flex items-center gap-3 hover:bg-slate-800/80 transition-all shadow-lg active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-white block">
                {isArabic ? "شحن الرصيد" : "Deposit"}
              </span>
              <span className="text-[10px] text-slate-400">
                {isArabic ? "USDT BEP-20 آلي" : "Instant BEP-20"}
              </span>
            </div>
          </div>
        </Link>

        <Link href={`${base}/Withdraw`}>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl flex items-center gap-3 hover:bg-slate-800/80 transition-all shadow-lg active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-white block">
                {isArabic ? "طلب سحب" : "Withdraw"}
              </span>
              <span className="text-[10px] text-slate-400">
                {isArabic ? "سحب فوري للمحفظة" : "Instant Payout"}
              </span>
            </div>
          </div>
        </Link>

        <Link href={`${base}/Referral`}>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl flex items-center gap-3 hover:bg-slate-800/80 transition-all shadow-lg active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-white block">
                {isArabic ? "مكافأة الإحالة" : "Invite & Earn"}
              </span>
              <span className="text-[10px] text-amber-400 font-bold">
                {isArabic ? "$100 لكل 10 أعضاء" : "$100 per 10"}
              </span>
            </div>
          </div>
        </Link>

        <Link href={`${base}/profile`}>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl flex items-center gap-3 hover:bg-slate-800/80 transition-all shadow-lg active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-white block">
                {isArabic ? "حسابي (الملف)" : "My Account"}
              </span>
              <span className="text-[10px] text-slate-400">
                {isArabic ? "إحصائيات وتفاصيل" : "Stats & Profile"}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* 4. Referral Quick Copy Pill */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl flex items-center justify-between gap-3 shadow-lg">
        <div className="truncate">
          <span className="text-[10px] text-slate-400 block">
            {isArabic ? "كود الإحالة الخاص بك (اربح 100$ مع كل 10 شحنات):" : "Your Referral Code:"}
          </span>
          <span className="text-sm font-black text-cyan-400 font-mono tracking-wider">
            {referralCode}
          </span>
        </div>

        <Button
          onClick={handleCopyInviteLink}
          size="sm"
          className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 flex items-center gap-1.5 shrink-0"
        >
          {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedCode ? (isArabic ? "تم النسخ" : "Copied") : (isArabic ? "نسخ الرابط" : "Copy")}</span>
        </Button>
      </div>
    </div>
  );
}
