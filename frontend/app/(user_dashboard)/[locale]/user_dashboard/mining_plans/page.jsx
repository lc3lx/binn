"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap, Sparkles, CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  useActivePlansQuery,
  useSubscribeToPlanMutation,
} from "@/api/services/user/plans/plans.query";
import { toast } from "sonner";

// Default fallback models if backend is cold
const fallbackScooters = [
  {
    _id: "e1",
    name: "E1",
    modelName: "E1",
    price: 50,
    deviceCount: 1,
    scooterIncome: 1.5,
    dailyIncome: 1.5,
    features: ["1 جهاز سكوتر كهربائي", "دخل السكوتر اليومي 1.50 USDT", "سحب يومي فوري"],
  },
  {
    _id: "e2",
    name: "E2",
    modelName: "E2",
    price: 220,
    deviceCount: 4,
    scooterIncome: 1.6,
    dailyIncome: 6.4,
    isPopular: true,
    features: ["4 أجهزة سكوتر كهربائي", "دخل السكوتر: 1.60 USDT", "إجمالي الدخل: 6.40 USDT"],
  },
  {
    _id: "e3",
    name: "E3",
    modelName: "E3",
    price: 500,
    deviceCount: 8,
    scooterIncome: 2.5,
    dailyIncome: 20.0,
    features: ["8 أجهزة سكوتر كهربائي", "دخل السكوتر: 2.50 USDT", "إجمالي الدخل: 20.00 USDT"],
  },
  {
    _id: "e4",
    name: "E4",
    modelName: "E4",
    price: 1000,
    deviceCount: 15,
    scooterIncome: 3.2,
    dailyIncome: 48.0,
    features: ["15 جهاز سكوتر أسطول", "دخل السكوتر: 3.20 USDT", "إجمالي الدخل: 48.00 USDT"],
  },
  {
    _id: "e5",
    name: "E5",
    modelName: "E5",
    price: 2000,
    deviceCount: 25,
    scooterIncome: 4.2,
    dailyIncome: 105.0,
    features: ["25 جهاز سكوتر طاقة", "دخل السكوتر: 4.20 USDT", "إجمالي الدخل: 105.00 USDT"],
  },
  {
    _id: "e6",
    name: "E6",
    modelName: "E6",
    price: 5000,
    deviceCount: 50,
    scooterIncome: 5.5,
    dailyIncome: 275.0,
    features: ["50 جهاز سكوتر أسطول رئاسي", "دخل السكوتر: 5.50 USDT", "إجمالي الدخل: 275.00 USDT"],
  },
];

export default function ScooterPlansPage() {
  const { locale } = useTranslations();
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [planToConfirm, setPlanToConfirm] = useState(null);
  const isArabic = locale === "ar";
  const base = `/${locale}/user_dashboard`;

  const { data: plansResponse, isLoading } = useActivePlansQuery({ activeOnly: true });
  const subscribeMutation = useSubscribeToPlanMutation();

  const sourcePlans = useMemo(() => {
    const list =
      plansResponse?.data?.data ||
      plansResponse?.data?.plans ||
      plansResponse?.data ||
      plansResponse?.plans;

    if (Array.isArray(list) && list.length > 0) return list;
    return fallbackScooters;
  }, [plansResponse]);

  const handleConfirmSubscribe = async () => {
    if (!planToConfirm) return;
    setSubscribingPlanId(planToConfirm._id);
    try {
      await subscribeMutation.mutateAsync(planToConfirm._id);
      toast.success(
        isArabic
          ? `تم استئجار سكوتر ${planToConfirm.name || planToConfirm.modelName} بنجاح! توجه لشاشة RIDE لبدء التشغيل.`
          : `Scooter ${planToConfirm.name || planToConfirm.modelName} leased successfully! Head to RIDE to power on.`
      );
      setPlanToConfirm(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          (isArabic ? "فشل الاستئجار: يرجى التأكد من توفر الرصيد الكافي" : "Lease failed: insufficient balance")
      );
    } finally {
      setSubscribingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-3 sm:px-4 pt-3 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-5 shadow-2xl text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-bold mb-1">
          <Zap className="w-3.5 h-3.5" />
          <span>{isArabic ? "أسطول طاقة السكوترات الكهربائية" : "Scooter Energy Fleet"}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          {isArabic ? "طاقة (تأجير واستثمار السكوتر)" : "Energy (Scooter Lease & Earnings)"}
        </h1>
        <p className="text-xs text-slate-400">
          {isArabic
            ? "اختر طراز السكوتر المناسب لبدء توليد دخل يومي فوري بالـ USDT"
            : "Choose a scooter model to start generating daily USDT profits"}
        </p>
      </div>

      {/* Scooters List */}
      <div className="space-y-4">
        {sourcePlans.map((scooter) => {
          const modelName = scooter.modelName || scooter.name || "E2";
          const deviceCount = scooter.deviceCount || 4;
          const price = scooter.price || 220;
          const dailyIncome = scooter.dailyIncome || (deviceCount * 1.6);
          const scooterIncome = scooter.scooterIncome || Number((dailyIncome / deviceCount).toFixed(2));

          return (
            <motion.div
              key={scooter._id || modelName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-5 shadow-2xl space-y-4"
            >
              {scooter.isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-600 text-slate-950 font-black text-[10px] uppercase px-4 py-1 rounded-bl-xl shadow-lg">
                  {isArabic ? "الأكثر طلباً" : "Popular"}
                </div>
              )}

              {/* Title & Price Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">{modelName}</h3>
                  <div className="text-xs font-semibold text-slate-400">
                    {isArabic ? `عدد الأجهزة: ${deviceCount}` : `${deviceCount} Devices`}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-cyan-400 font-mono">
                    {price} <span className="text-xs text-slate-400">USDT</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {isArabic ? "سعر التأجير" : "Lease Price"}
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="py-2 flex items-center justify-center">
                <img
                  src={scooter.scooterImage || "/scooter_transparent.png"}
                  alt={modelName}
                  className="w-48 h-48 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform"
                />
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-center">
                  <span className="text-[10px] text-slate-400 block mb-0.5">
                    {isArabic ? "دخل السكوتر" : "Scooter Income"}
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {scooterIncome} <span className="text-[10px] text-slate-400 font-normal">USDT</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-center">
                  <span className="text-[10px] text-slate-400 block mb-0.5">
                    {isArabic ? "إجمالي الدخل اليومي" : "Daily Income"}
                  </span>
                  <span className="font-extrabold text-cyan-400 text-sm">
                    {dailyIncome} <span className="text-[10px] text-slate-400 font-normal">USDT</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => setPlanToConfirm(scooter)}
                className="w-full py-5 rounded-2xl bg-[#0c2a54] hover:bg-[#103569] text-white font-extrabold text-sm shadow-xl shadow-blue-950/60 border border-blue-500/40 transition-all active:scale-[0.98]"
              >
                {isArabic ? `تأجير سكوتر ${modelName} الآن` : `Lease ${modelName} Now`}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={Boolean(planToConfirm)} onOpenChange={(open) => !open && setPlanToConfirm(null)}>
        <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white text-center">
              {isArabic ? "تأكيد استئجار السكوتر" : "Confirm Scooter Lease"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs text-center pt-2">
              {isArabic
                ? `سيتم خصم ${planToConfirm?.price} USDT من رصيد محفظتك وتفعيل سكوتر ${planToConfirm?.name || planToConfirm?.modelName} في شاشة RIDE فوراً.`
                : `Deduct ${planToConfirm?.price} USDT from your wallet to activate ${planToConfirm?.name || planToConfirm?.modelName} in RIDE.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPlanToConfirm(null)}
              className="text-slate-400 hover:text-white"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSubscribe}
              disabled={Boolean(subscribingPlanId)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
            >
              {subscribingPlanId
                ? isArabic ? "جارٍ التفعيل..." : "Activating..."
                : isArabic ? "تأكيد الاستئجار" : "Confirm Lease"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
