"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTodayTaskStatusQuery } from "@/api/services/user/tasks/tasks.query";
import { useDashboardSummaryQuery } from "@/api/services/user/Statistics/statistics.query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Globe,
  ChevronRight,
  Users,
  Award,
  Wallet,
  MessageSquarePlus,
  History,
  ArrowUpRight,
  LogOut,
  Star,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function UserProfilePage() {
  const { locale } = useTranslations();
  const { user, logout } = useAuth();
  const isArabic = locale === "ar";
  const base = `/${locale}/user_dashboard`;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: statusResponse } = useTodayTaskStatusQuery();
  const { data: summaryResponse } = useDashboardSummaryQuery();

  const taskData = statusResponse?.data || {};
  const summary = summaryResponse?.data || {};

  const userId = taskData.userId || 1649;
  const maskedPhone =
    taskData.maskedAccount ||
    (user?.phone ? `***${user.phone.slice(-4)}` : `***9742`);
  const activeTier = taskData.activeTier || "E2";
  const progressValue = taskData.progress || 72;
  const totalIncome = taskData.totalIncome ?? 5.0;
  const availableToClaim = taskData.availableToClaim ?? 5.0;
  const todayIncome = taskData.todayIncome ?? 5.0;

  const handleReviewSubmit = () => {
    setSubmittingReview(true);
    setTimeout(() => {
      setSubmittingReview(false);
      setReviewOpen(false);
      setReviewText("");
      toast.success(
        isArabic ? "شكراً لك! تم إرسال مراجعتك بنجاح." : "Thank you! Review submitted."
      );
    }, 800);
  };

  const menuItems = [
    {
      id: "team_size",
      label: isArabic ? "حجم الفريق" : "Team Size",
      href: `${base}/Referral`,
      icon: Users,
    },
    {
      id: "team_result",
      label: isArabic ? "نتيجة الفريق" : "Team Result",
      href: `${base}/Referral`,
      icon: Award,
    },
    {
      id: "income_details",
      label: isArabic ? "تفاصيل الدخل" : "Income Details",
      href: `${base}/Transactions`,
      icon: Wallet,
      badge: `${totalIncome}`,
    },
    {
      id: "write_review",
      label: isArabic ? "اكتب مراجعة" : "Write a Review",
      onClick: () => setReviewOpen(true),
      icon: MessageSquarePlus,
    },
    {
      id: "renewal_history",
      label: isArabic ? "سجل التجديد" : "Recharge History",
      href: `${base}/Transactions`,
      icon: History,
    },
    {
      id: "deposit_funds",
      label: isArabic ? "اشحن رصيدك" : "Recharge Your Balance",
      href: `${base}/deposit`,
      icon: ArrowUpRight,
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen pb-24 px-3 sm:px-4 pt-3 max-w-lg mx-auto space-y-4">
      {/* 1. TOP PROFILE CARD matching Image 2 & 4 */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-5 shadow-2xl">
        {/* User Info Header */}
        <div className="flex items-start justify-between">
          {/* Left / Start Info */}
          <div className="space-y-1">
            <div className="text-xl font-extrabold text-white tracking-wider">
              ID: {userId}
            </div>
            <div className="text-sm font-semibold text-slate-300 font-mono">
              {maskedPhone}
            </div>

            {/* Scooter Badge Thumbnail */}
            <div className="pt-2">
              <div className="w-16 h-16 rounded-2xl bg-black/60 border border-slate-700/80 p-1 flex items-center justify-center shadow-inner">
                <img
                  src="/scooter_transparent.png"
                  alt="Scooter"
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right / End Info (Tier & Active Status) */}
          <div className="flex flex-col items-end space-y-1.5">
            <div className="px-6 py-2 rounded-2xl bg-slate-800/90 border border-slate-700 font-extrabold text-xl text-white shadow-md">
              {activeTier}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>{isArabic ? "حالة : بنشاط" : "Status: Active"}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar with Number (72) */}
        <div className="mt-5 space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-slate-800/80 border border-slate-700/60 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 shadow-[0_0_10px_#06b6d4]"
                style={{ width: `${Math.min(100, progressValue)}%` }}
              />
            </div>
            <span className="text-sm font-extrabold text-white font-mono">
              {progressValue}
            </span>
          </div>
        </div>

        {/* Three Stat Boxes Grid matching screenshot */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          {/* Total Income */}
          <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block mb-1">
              {isArabic ? "إجمالي الدخل:" : "Total Income:"}
            </span>
            <div className="text-base sm:text-lg font-extrabold text-white">
              {totalIncome}
            </div>
          </div>

          {/* Available to Claim */}
          <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block mb-1">
              {isArabic ? "متاح للاستلام:" : "Available:"}
            </span>
            <div className="text-base sm:text-lg font-extrabold text-white">
              {availableToClaim}
            </div>
          </div>

          {/* Today's Income */}
          <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block mb-1">
              {isArabic ? "دخل هذا اليوم:" : "Today's Income:"}
            </span>
            <div className="text-base sm:text-lg font-extrabold text-white">
              {todayIncome}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRAVEL TOGETHER BUTTON ("السفر معا") matching screenshot */}
      <Link
        href={`${base}/tasks`}
        className="w-full py-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl flex items-center justify-center gap-2 font-extrabold text-white shadow-xl hover:bg-slate-800/80 transition-all active:scale-[0.98]"
      >
        <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Globe className="w-4 h-4 text-cyan-400" />
        </span>
        <span className="text-sm sm:text-base">
          {isArabic ? "السفر معا" : "Travel Together"}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </Link>

      {/* 3. MENU ITEMS LIST matching screenshot */}
      <div className="space-y-2.5">
        {menuItems.map((item) => {
          const content = (
            <div
              className={`w-full p-4 rounded-2xl border backdrop-blur-2xl flex items-center justify-between transition-all active:scale-[0.99] shadow-lg ${
                item.highlight
                  ? "bg-gradient-to-r from-blue-950/60 to-slate-900/80 border-blue-500/40 text-white"
                  : "bg-slate-900/70 border-slate-700/50 text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.highlight ? "text-cyan-400" : "text-slate-400"}`} />
                <span className="text-sm font-bold">{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="font-extrabold text-cyan-400 text-sm">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="w-full text-left"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.href} className="block">
              {content}
            </Link>
          );
        })}
      </div>

      {/* 4. LOGOUT BUTTON */}
      <div className="pt-2">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full py-5 rounded-2xl border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-950/30 font-bold text-sm flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{isArabic ? "تسجيل الخروج" : "Log Out"}</span>
        </Button>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white text-center">
              {isArabic ? "اكتب مراجعة عن تجربة ETG Ride" : "Write an ETG Ride Review"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-125"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={
                isArabic
                  ? "شاركنا رأيك في سرعة الأرباح وتشغيل السكوترات..."
                  : "Share your experience with ETG Scooter profits..."
              }
              className="w-full bg-slate-950/80 border border-slate-700 text-white min-h-[100px] rounded-2xl p-3 resize-none text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReviewOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={handleReviewSubmit}
              disabled={submittingReview}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
            >
              {submittingReview
                ? isArabic ? "جارٍ الإرسال..." : "Sending..."
                : isArabic ? "إرسال المراجعة" : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
