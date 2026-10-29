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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatApiError } from "@/lib/format-error";
import { motion, AnimatePresence } from "framer-motion";
import {
  Power,
  DollarSign,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function RideScootersPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const base = `/${locale}/user_dashboard`;

  const [activeTab, setActiveTab] = useState("in_progress"); // 'in_progress' | 'completed'
  const [countdown, setCountdown] = useState("05:00:00");
  const [isPowering, setIsPowering] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [showPauseWarning, setShowPauseWarning] = useState(false);

  const { data: statusResponse, refetch, isLoading } = useTodayTaskStatusQuery();
  const powerOnMutation = usePowerOnScooterMutation();
  const collectMutation = useCollectScooterEarningsMutation();
  const collectAllMutation = useCollectAllScootersMutation();

  const taskData = statusResponse?.data || {};
  const activeScooters = taskData.activeScooters || [];
  const primaryScooter = activeScooters[0] || {
    modelName: "E1",
    deviceCount: 1,
    countdown: "05:00:00",
    remainingSeconds: 18000,
    dailyIncome: 2.5,
    scooterIncome: 2.5,
    status: "OPEN",
    price: 50,
    purchasedAt: "09-06-2026 10:34:33",
    currentIncome: 0,
    image: "/scooter_transparent.png",
    canCollect: false,
    canPowerOn: true,
    claimedToday: false,
    isCompleted: false,
  };

  const isScooterRunning = primaryScooter.status === "PROGRESS";
  const isCompleted = Boolean(primaryScooter.isCompleted || primaryScooter.status === "COMPLETED");
  const claimedToday = Boolean(primaryScooter.claimedToday || taskData.claimedToday);
  const remainingSeconds = Number(primaryScooter.remainingSeconds ?? 18000);
  const runSecondsToday = Number(primaryScooter.runSecondsToday ?? 0);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((18000 - remainingSeconds) / 18000) * 100))
  );

  // Real-time countdown effect when in progress
  useEffect(() => {
    if (!isScooterRunning) {
      if (claimedToday) {
        setCountdown("00:00:00");
      } else if (isCompleted) {
        setCountdown("00:00:00");
      } else {
        setCountdown(primaryScooter.countdown || "05:00:00");
      }
      return;
    }

    setCountdown(primaryScooter.countdown || "05:00:00");
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const parts = prev.split(":").map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) return "05:00:00";
        let [h, m, s] = parts;
        if (h === 0 && m === 0 && s === 0) {
          // 5 hours finished!
          refetch();
          return "00:00:00";
        }
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
  }, [isScooterRunning, primaryScooter.countdown, isCompleted, claimedToday, refetch]);

  // Handle Power Button click
  const handlePowerClick = () => {
    if (claimedToday) {
      toast.info(
        isArabic
          ? "لقد أتممت مهمة اليوم واستلمت أرباحك بنجاح! تبدأ المهمة القادمة غداً."
          : "You have completed today's mission and claimed your profits! Next mission starts tomorrow."
      );
      return;
    }

    if (isCompleted) {
      toast.info(
        isArabic
          ? "مهمة الـ 5 ساعات مكتملة وجاهزة للتحصيل! اضغط على زر ($) لاستلام أرباح اليوم."
          : "5-hour mission is complete! Click the ($) button to collect your profits."
      );
      return;
    }

    // If currently running, user is attempting to pause before 5 hours -> Show Warning Modal!
    if (isScooterRunning) {
      setShowPauseWarning(true);
      return;
    }

    // If turned off, start running immediately
    executePowerToggle();
  };

  // Perform the actual API toggle
  const executePowerToggle = async () => {
    setIsPowering(true);
    try {
      const res = await powerOnMutation.mutateAsync(primaryScooter.id);
      toast.success(res.message || (isArabic ? "تم تحديث حالة السكوتر" : "Scooter state updated"));
      refetch();
    } catch (err) {
      toast.error(formatApiError(err, locale));
    } finally {
      setIsPowering(false);
      setShowPauseWarning(false);
    }
  };

  // Handle Collect Button ($)
  const handleCollect = async () => {
    if (claimedToday) {
      toast.info(
        isArabic
          ? "تم استلام أرباح هذا اليوم بالفعل! المهمة الجديدة تبدأ غداً."
          : "Today's profit has already been collected! Next task starts tomorrow."
      );
      return;
    }

    if (!isCompleted) {
      toast.warning(
        isArabic
          ? `لا يمكنك استلام الأرباح حتى تكتمل مهمة التشغيل (5 ساعات كاملة). متبقي: ${countdown}`
          : `You cannot collect profits until completing 5 full hours. Remaining: ${countdown}`
      );
      return;
    }

    setIsCollecting(true);
    try {
      const res = await collectMutation.mutateAsync(primaryScooter.id);
      toast.success(
        res.message ||
          (isArabic
            ? `تهانينا! تم جمع ${primaryScooter.dailyIncome} USDT بنجاح!`
            : `Success! ${primaryScooter.dailyIncome} USDT collected!`)
      );
      refetch();
    } catch (err) {
      toast.error(formatApiError(err, locale));
    } finally {
      setIsCollecting(false);
    }
  };

  // Handle Collect All ("جمع في نقرة واحدة")
  const handleCollectAll = async () => {
    if (claimedToday) {
      toast.info(
        isArabic
          ? "تم استلام كافة أرباح اليوم بالفعل!"
          : "All profits for today have already been collected!"
      );
      return;
    }

    if (!isCompleted) {
      toast.warning(
        isArabic
          ? `يجب إكمال رحلة الـ 5 ساعات كاملة أولاً. متبقي: ${countdown}`
          : `Must complete 5 hours first. Remaining: ${countdown}`
      );
      return;
    }

    setIsCollecting(true);
    try {
      const res = await collectAllMutation.mutateAsync();
      toast.success(res.message || (isArabic ? "تم جمع كافة الأرباح بنجاح!" : "All earnings collected!"));
      refetch();
    } catch (err) {
      toast.error(formatApiError(err, locale));
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-3 sm:px-4 pt-3 max-w-lg mx-auto space-y-4">
      {/* 1. Top Navigation Pills (في العمل / مكتمل) */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <button
          onClick={() => setActiveTab("in_progress")}
          className={`py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 shadow-md ${
            activeTab === "in_progress"
              ? "bg-[#0c2a54] text-white border border-blue-500/50 shadow-blue-900/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
          }`}
        >
          {isArabic ? "في العمل (مهمة اليوم)" : "In Operation (Today's Mission)"}
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 shadow-md ${
            activeTab === "completed"
              ? "bg-[#0c2a54] text-white border border-blue-500/50 shadow-blue-900/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
          }`}
        >
          {isArabic ? "سجل التحصيل" : "Collection Log"}
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
          {/* Mission Requirement Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 border border-blue-500/30 p-3.5 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white">
                  {isArabic ? "مهمة الرحلة اليومية (5 ساعات)" : "Daily Trip Mission (5 Hours)"}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {claimedToday
                    ? isArabic ? "تم استلام أرباح اليوم بنجاح!" : "Today's profit claimed successfully!"
                    : isCompleted
                    ? isArabic ? "اكتملت الـ 5 ساعات! جاهز للتحصيل الآن" : "5 hours complete! Ready to claim"
                    : isScooterRunning
                    ? isArabic ? "السكوتر قيد التشغيل والرحلة جارية" : "Scooter is running trip"
                    : isArabic ? "شغّل السكوتر لمدة 5 ساعات لتحصيل ربح اليوم" : "Power on for 5 hours to earn today's yield"}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span
                className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                  claimedToday
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : isCompleted
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                    : isScooterRunning
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {claimedToday
                  ? isArabic ? "تم الاستلام" : "Claimed"
                  : isCompleted
                  ? isArabic ? "جاهز للتحصيل" : "Ready"
                  : isScooterRunning
                  ? isArabic ? "قيد الرحلة" : "Running"
                  : isArabic ? "متوقف" : "Idle"}
              </span>
            </div>
          </div>

          {/* Main Scooter Device Card */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-5 shadow-2xl space-y-4">
            {/* Top row: Model title on left, Action buttons on right */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-0.5">
                  {isArabic ? "الأسطول المدمج النشط" : "Consolidated Active Fleet"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                  {primaryScooter.modelName}
                </h2>
              </div>

              {/* Action Buttons: Maroon $ and Royal Blue Power */}
              <div className="flex items-center gap-2.5">
                {/* Collect Button ($) */}
                <button
                  onClick={handleCollect}
                  disabled={isCollecting || claimedToday || !isCompleted}
                  title={
                    claimedToday
                      ? isArabic ? "تم استلام أرباح اليوم" : "Claimed today"
                      : isCompleted
                      ? isArabic ? "اضغط لجمع الأرباح فوراً" : "Click to collect profits"
                      : isArabic ? "غير متاح قبل إكمال 5 ساعات" : "Locked until 5 hours complete"
                  }
                  className={`w-12 h-12 rounded-2xl font-extrabold text-xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                    claimedToday
                      ? "bg-emerald-950/40 text-emerald-500/60 border border-emerald-800/30 opacity-60 cursor-not-allowed"
                      : isCompleted
                      ? "bg-gradient-to-br from-[#8c1221] to-[#b31b2c] text-white shadow-red-600/50 border border-red-400 animate-bounce cursor-pointer"
                      : "bg-[#45070f]/50 text-slate-400/50 border border-red-950/40 opacity-40 cursor-not-allowed"
                  }`}
                >
                  {claimedToday ? (
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <DollarSign className="w-7 h-7 stroke-[2.5]" />
                  )}
                </button>

                {/* Power Button (⏻) */}
                <button
                  onClick={handlePowerClick}
                  disabled={isPowering || claimedToday}
                  title={
                    claimedToday
                      ? isArabic ? "مكتمل لليوم" : "Completed today"
                      : isScooterRunning
                      ? isArabic ? "إيقاف السكوتر مؤقتاً" : "Pause Scooter"
                      : isArabic ? "تشغيل السكوتر لبدء الـ 5 ساعات" : "Power On Scooter"
                  }
                  className={`w-12 h-12 rounded-2xl font-bold flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50 border ${
                    claimedToday
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40 opacity-80"
                      : isScooterRunning
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/40 border-cyan-400 animate-pulse"
                      : "bg-gradient-to-br from-[#103260] to-[#0a1e3b] hover:from-[#153f78] hover:to-[#0f284e] text-blue-200 shadow-blue-950/60 border-blue-500/40"
                  }`}
                >
                  <Power className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* High-Resolution Scooter Graphic */}
            <div className="relative my-2 flex items-center justify-center py-2">
              <div
                className={`absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
                  isScooterRunning
                    ? "bg-cyan-500/20 scale-125 animate-pulse"
                    : "bg-blue-500/10"
                }`}
              />
              <img
                src={primaryScooter.image || "/scooter_transparent.png"}
                alt={primaryScooter.modelName}
                className={`w-60 h-60 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transform transition-transform duration-500 ${
                  isScooterRunning ? "scale-105" : "hover:scale-105"
                }`}
              />
            </div>

            {/* Progress Bar (5-Hour Task Completion) */}
            <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">
                  {isArabic ? "تقدم رحلة الـ 5 ساعات:" : "5-Hour Trip Progress:"}
                </span>
                <span className="font-bold text-cyan-400 font-mono">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 border border-slate-700/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Device Count & Countdown */}
            <div className="space-y-1.5 text-center sm:text-right pt-1">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="font-semibold text-slate-300">
                  {isArabic ? "عدد الأجهزة في الأسطول:" : "Fleet Devices:"}{" "}
                  <span className="text-white font-bold">{primaryScooter.deviceCount}</span>
                </div>

                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>{isArabic ? "الوقت المتبقي:" : "Remaining:"}</span>
                  <span className="font-mono text-cyan-400 font-bold tracking-wider text-sm sm:text-base bg-slate-800/60 px-2.5 py-0.5 rounded-lg border border-slate-700/60">
                    {countdown}
                  </span>
                </div>
              </div>
            </div>

            {/* Spec Details Grid */}
            <div className="mt-2 pt-3 border-t border-slate-800/80 space-y-3 text-xs sm:text-sm">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":إجمالي الدخل اليومي (5%)" : "Daily Yield (5%):"}
                  </span>
                  <span className="font-bold text-cyan-400 text-sm">
                    {primaryScooter.dailyIncome} <span className="text-xs text-slate-400 font-normal">USDT</span>
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":دخل السكوتر الواحد" : "Per Device Yield:"}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {primaryScooter.scooterIncome || 2.5} <span className="text-xs text-slate-400 font-normal">USDT</span>
                  </span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/40">
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":حالة المهمة" : "Task State:"}
                  </span>
                  <span
                    className={`font-bold uppercase tracking-wider text-sm ${
                      claimedToday
                        ? "text-emerald-400"
                        : isCompleted
                        ? "text-amber-400"
                        : isScooterRunning
                        ? "text-cyan-400"
                        : "text-slate-400"
                    }`}
                  >
                    {claimedToday
                      ? "CLAIMED (مكتمل ومستلم)"
                      : isCompleted
                      ? "COMPLETED (جاهز للاستلام)"
                      : isScooterRunning
                      ? "PROGRESS (قيد الرحلة)"
                      : "OPEN (جاهز للتشغيل)"}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":إجمالي استثمار الأسطول" : "Total Fleet Value:"}
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
                    {isArabic ? ":وقت الشراء والتفعيل" : "Activated At:"}
                  </span>
                  <span className="font-mono text-slate-300 text-xs">
                    {primaryScooter.purchasedAt || "09-06-2026 10:34:33"}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 text-xs block">
                    {isArabic ? ":أرباح اليوم المستلمة" : "Today Collected:"}
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {claimedToday ? primaryScooter.dailyIncome : 0}{" "}
                    <span className="text-xs text-slate-400 font-normal">USDT</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to Upgrade or Lease more scooters */}
          <div className="text-center pt-1">
            <Link
              href={`${base}/mining_plans`}
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-xl hover:bg-slate-800/40"
            >
              <Zap className="w-4 h-4" />
              <span>
                {isArabic
                  ? "ترقية الباقة ودمج سكوترات إضافية في أسطولك (طاقة)"
                  : "Upgrade fleet & stack additional scooters (Energy)"}
              </span>
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
          {/* Completed State Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-8 shadow-2xl text-center min-h-[340px] flex flex-col items-center justify-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-1">
              <Sparkles className="w-10 h-10 text-cyan-400" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white">
              {claimedToday
                ? isArabic ? "تم استلام أرباح اليوم بنجاح!" : "Today's Yield Collected!"
                : isCompleted
                ? isArabic ? "اكتملت مهمة الـ 5 ساعات وجاهزة للتحصيل!" : "5 Hours Completed & Ready!"
                : isArabic ? "المهمة جارية أو لم تكتمل بعد" : "Mission In Progress"}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs">
              {claimedToday
                ? isArabic
                  ? `تم إيداع ${primaryScooter.dailyIncome} USDT في رصيدك المتاح. تبدأ دورة الـ 5 ساعات الجديدة غداً.`
                  : `Deposited ${primaryScooter.dailyIncome} USDT into your wallet. Next 5-hour cycle starts tomorrow.`
                : isCompleted
                ? isArabic
                  ? "اضغط أدناه لجمع أرباح الأسطول بنقرة واحدة مباشرة إلى محفظتك."
                  : "Click below to collect all fleet earnings in one click directly to your wallet."
                : isArabic
                ? "يجب إكمال تشغيل السكوتر لمدة 5 ساعات لتظهر الأرباح جاهزة للتحصيل هنا."
                : "Complete the 5-hour run to unlock yield collection."}
            </p>
          </div>

          {/* Sticky/Bottom One-Click Collect Button */}
          <div className="pt-2">
            <Button
              onClick={handleCollectAll}
              disabled={isCollecting || claimedToday || !isCompleted}
              className={`w-full py-6 rounded-2xl font-extrabold text-base shadow-xl transition-all active:scale-[0.98] ${
                claimedToday
                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 opacity-70 cursor-not-allowed"
                  : isCompleted
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-900/50 border border-cyan-400 cursor-pointer animate-pulse"
                  : "bg-slate-800 text-slate-500 border border-slate-700 opacity-50 cursor-not-allowed"
              }`}
            >
              <DollarSign className="w-5 h-5 mr-1" />
              {isCollecting
                ? isArabic ? "جارٍ الجمع..." : "Collecting..."
                : claimedToday
                ? isArabic ? "تم استلام أرباح اليوم (+USDT)" : "Already Claimed Today"
                : isCompleted
                ? isArabic ? `جمع الأرباح الآن (${primaryScooter.dailyIncome} USDT)` : `Collect Yield Now (${primaryScooter.dailyIncome} USDT)`
                : isArabic ? `مغلق حتى إكمال 5 ساعات (${countdown})` : `Locked until 5h complete (${countdown})`}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Confirmation Dialog for Pausing Before 5 Hours */}
      <Dialog open={showPauseWarning} onOpenChange={setShowPauseWarning}>
        <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-sm rounded-3xl p-6">
          <DialogHeader className="space-y-3 text-center sm:text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <DialogTitle className="text-lg font-bold text-white text-center">
              {isArabic ? "تنبيه إيقاف السكوتر المؤقت" : "Scooter Pause Warning"}
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs text-center leading-relaxed">
              {isArabic
                ? "السكوتر لم يكمل مدة الرحلة اليومية (5 ساعات). للحصول على الأرباح اليومية، يجب أن يكتمل التشغيل لمدة 5 ساعات كاملة. هل أنت متأكد من إيقاف التشغيل مؤقتاً؟"
                : "The scooter has not completed its 5-hour daily mission. To receive your daily profits, you must run it for the full 5 hours. Are you sure you want to pause?"}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
            <Button
              type="button"
              onClick={() => setShowPauseWarning(false)}
              className="w-full py-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg"
            >
              {isArabic ? "متابعة الرحلة وعدم الإيقاف" : "Keep Running Trip"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={executePowerToggle}
              disabled={isPowering}
              className="w-full py-5 rounded-xl border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs"
            >
              {isPowering
                ? isArabic ? "جارٍ الإيقاف..." : "Pausing..."
                : isArabic ? "تأكيد الإيقاف المؤقت" : "Confirm Pause"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
