"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import {
  useTodayTaskStatusQuery,
  usePowerOnScooterMutation,
  useCollectScooterEarningsMutation,
  useCollectAllScootersMutation,
} from "@/api/services/user/tasks/tasks.query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Power, DollarSign, Check, ChevronRight, Sparkles, Zap, ShieldCheck } from "lucide-react";

export default function RideScootersPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const base = `/${locale}/user_dashboard`;

  const [activeTab, setActiveTab] = useState("in_progress"); // 'in_progress' | 'completed'
  const [countdown, setCountdown] = useState("04:59:50");
  const [isPowering, setIsPowering] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  const { data: statusResponse, refetch, isLoading } = useTodayTaskStatusQuery();
  const powerOnMutation = usePowerOnScooterMutation();
  const collectMutation = useCollectScooterEarningsMutation();
  const collectAllMutation = useCollectAllScootersMutation();

  const taskData = statusResponse?.data || {};
  const activeScooters = taskData.activeScooters || [];
  const primaryScooter = activeScooters[0] || {
    modelName: "E2",
    deviceCount: 4,
    countdown: "04:59:50",
    dailyIncome: 6.4,
    scooterIncome: 1.6,
    status: "OPEN",
    price: 220,
    purchasedAt: "09-06-2026 10:34:33",
    currentIncome: 0,
    image: "/scooter_transparent.png",
  };

  const isScooterRunning = primaryScooter.status === "PROGRESS";

  // Real-time countdown effect when in progress
  useEffect(() => {
    if (!isScooterRunning) {
      setCountdown("00:00:00");
      return;
    }

    setCountdown(primaryScooter.countdown || "04:59:50");
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const parts = prev.split(":").map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) return "04:59:50";
        let [h, m, s] = parts;
        if (h === 0 && m === 0 && s === 0) return "00:00:00";
        if (s > 0) s -= 1;
        else {
          s = 59;
          if (m > 0) m -= 1;
          else {
            m = 59;
            if (h > 0) h -= 1;
          }
        }
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isScooterRunning, primaryScooter.countdown]);

  // Handle Power Button Toggle
  const handlePowerToggle = async () => {
    setIsPowering(true);
    try {
      const res = await powerOnMutation.mutateAsync(primaryScooter.id);
      toast.success(res.message || (isArabic ? "تم تبديل حالة السكوتر" : "Scooter state toggled"));
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || (isArabic ? "حدث خطأ" : "An error occurred"));
    } finally {
      setIsPowering(false);
    }
  };

  // Handle Collect Button ($)
  const handleCollect = async () => {
    setIsCollecting(true);
    try {
      const res = await collectMutation.mutateAsync(primaryScooter.id);
      toast.success(res.message || (isArabic ? "تم جمع الأرباح بنجاح!" : "Earnings collected!"));
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || (isArabic ? "حدث خطأ أثناء الجمع" : "Collection error"));
    } finally {
      setIsCollecting(false);
    }
  };

  // Handle Collect All ("جمع في نقرة واحدة")
  const handleCollectAll = async () => {
    setIsCollecting(true);
    try {
      const res = await collectAllMutation.mutateAsync();
      toast.success(res.message || (isArabic ? "تم جمع كافة الأرباح بنجاح!" : "All earnings collected!"));
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || (isArabic ? "حدث خطأ" : "Collection error"));
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-3 sm:px-4 pt-3 max-w-lg mx-auto">
      {/* 1. Top Navigation Pills (في العمل / مكتمل) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setActiveTab("in_progress")}
          className={`py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 shadow-md ${
            activeTab === "in_progress"
              ? "bg-[#0c2a54] text-white border border-blue-500/50 shadow-blue-900/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
          }`}
        >
          {isArabic ? "في العمل" : "In Operation"}
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 shadow-md ${
            activeTab === "completed"
              ? "bg-[#0c2a54] text-white border border-blue-500/50 shadow-blue-900/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
          }`}
        >
          {isArabic ? "مكتمل" : "Completed"}
        </button>
      </div>

      {/* 2. TAB: IN PROGRESS (في العمل) */}
      {activeTab === "in_progress" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Main Scooter Device Card */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-5 shadow-2xl">
            {/* Top row: Model title on left, Action buttons on right */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                  {primaryScooter.modelName}
                </h2>
              </div>

              {/* Action Buttons: Maroon $ and Royal Blue Power */}
              <div className="flex items-center gap-2.5">
                {/* Collect Button ($) */}
                <button
                  onClick={handleCollect}
                  disabled={isCollecting}
                  title={isArabic ? "جمع الدخل" : "Collect Income"}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#730f1b] to-[#45070f] hover:from-[#8c1221] hover:to-[#570a13] text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-red-950/60 border border-red-500/30 transition-transform active:scale-95 disabled:opacity-50"
                >
                  <DollarSign className="w-7 h-7 stroke-[2.5]" />
                </button>

                {/* Power Button (⏻) */}
                <button
                  onClick={handlePowerToggle}
                  disabled={isPowering}
                  title={isArabic ? "تشغيل / إيقاف السكوتر" : "Toggle Scooter"}
                  className={`w-12 h-12 rounded-2xl font-bold flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50 border ${
                    isScooterRunning
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/40 border-cyan-400 animate-pulse"
                      : "bg-gradient-to-br from-[#103260] to-[#0a1e3b] hover:from-[#153f78] hover:to-[#0f284e] text-blue-200 shadow-blue-950/60 border-blue-500/40"
                  }`}
                >
                  <Power className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* High-Resolution Scooter Graphic */}
            <div className="relative my-4 flex items-center justify-center py-2">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <img
                src={primaryScooter.image || "/scooter_transparent.png"}
                alt={primaryScooter.modelName}
                className="w-60 h-60 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transform hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Device Count & Countdown */}
            <div className="space-y-1.5 text-center sm:text-right border-t border-slate-800/80 pt-4">
              <div className="text-sm font-semibold text-slate-300">
                {isArabic ? "عدد الأجهزة" : "Number of devices"}:{" "}
                <span className="text-white font-bold">{primaryScooter.deviceCount}</span>
              </div>

              <div className="text-sm font-semibold text-slate-300">
                {isArabic ? "العد التنازلي" : "Countdown"}:{" "}
                <span className="font-mono text-cyan-400 font-bold tracking-wider text-base">
                  {countdown}
                </span>
              </div>
            </div>

            {/* Spec Details Grid (Two columns matching screenshot) */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3 text-xs sm:text-sm">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":الدخل اليومي" : "Daily Income:"}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {primaryScooter.dailyIncome} <span className="text-xs text-slate-400 font-normal">USDT</span>
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":دخل السكوتر" : "Scooter Income:"}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {primaryScooter.scooterIncome} <span className="text-xs text-slate-400 font-normal">USDT</span>
                  </span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/40">
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":ولاية" : "Status:"}
                  </span>
                  <span className="font-bold uppercase tracking-wider text-cyan-400 text-sm">
                    {isScooterRunning ? "PROGRESS" : "OPEN"}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":سعر" : "Price:"}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {primaryScooter.price} <span className="text-xs text-slate-400 font-normal">USDT</span>
                  </span>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/40">
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":وقت الشراء" : "Purchase Time:"}
                  </span>
                  <span className="font-mono text-slate-300 text-xs">
                    {primaryScooter.purchasedAt || "09-06-2026 10:34:33"}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":الدخل الحالي" : "Current Income:"}
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {primaryScooter.currentIncome || 0} <span className="text-xs text-slate-400 font-normal">USDT</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to Lease more scooters */}
          <div className="text-center pt-2">
            <Link
              href={`${base}/mining_plans`}
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>{isArabic ? "استئجار طرازات سكوتر إضافية (طاقة)" : "Lease more scooter models (Energy)"}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* 3. TAB: COMPLETED (مكتمل) */}
      {activeTab === "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Completed State Card matching Image 1 */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-8 shadow-2xl text-center min-h-[360px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-cyan-400" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              {isArabic ? "لا توجد مشاركات حتى الآن" : "No participations yet"}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs">
              {isArabic
                ? "يمكنك جمع كافة أرباح السكوترات النشطة دفعة واحدة مباشرة في محفظتك"
                : "You can collect all active scooter profits in one click directly to your wallet"}
            </p>
          </div>

          {/* Sticky/Bottom One-Click Collect Button matching screenshot */}
          <div className="pt-2">
            <Button
              onClick={handleCollectAll}
              disabled={isCollecting}
              className="w-full py-6 rounded-2xl bg-[#0c2a54] hover:bg-[#103569] text-white font-extrabold text-base shadow-xl shadow-blue-950/70 border border-blue-500/40 transition-all active:scale-[0.98]"
            >
              <DollarSign className="w-5 h-5 mr-1" />
              {isCollecting
                ? isArabic ? "جارٍ الجمع..." : "Collecting..."
                : isArabic ? "جمع في نقرة واحدة" : "One-Click Collect All"}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
