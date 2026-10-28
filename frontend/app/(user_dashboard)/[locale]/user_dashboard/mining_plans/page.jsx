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
import { formatApiError } from "@/lib/format-error";

// Default fallback models if backend is cold
const fallbackScooters = [
  {
    _id: "e1",
    name: "E1",
    modelName: "E1",
    price: 50,
    deviceCount: 1,
    scooterIncome: 2.5,
    dailyIncome: 2.5,
    features: ["1 جهاز سكوتر كهربائي", "دخل السكوتر اليومي 2.50 USDT", "سحب يومي فوري"],
  },
  {
    _id: "e2",
    name: "E2",
    modelName: "E2",
    price: 100,
    deviceCount: 2,
    scooterIncome: 2.5,
    dailyIncome: 5.0,
    features: ["2 جهاز سكوتر متطور", "دخل السكوتر: 2.50 USDT", "إجمالي الدخل: 5.00 USDT"],
  },
  {
    _id: "e3",
    name: "E3",
    modelName: "E3",
    price: 200,
    deviceCount: 4,
    scooterIncome: 2.5,
    dailyIncome: 10.0,
    isPopular: true,
    features: ["4 أجهزة سكوتر كهربائي", "دخل السكوتر: 2.50 USDT", "إجمالي الدخل: 10.00 USDT"],
  },
  {
    _id: "e4",
    name: "E4",
    modelName: "E4",
    price: 500,
    deviceCount: 10,
    scooterIncome: 2.5,
    dailyIncome: 25.0,
    features: ["10 أجهزة سكوتر كهربائي", "دخل السكوتر: 2.50 USDT", "إجمالي الدخل: 25.00 USDT"],
  },
  {
    _id: "e5",
    name: "E5",
    modelName: "E5",
    price: 1000,
    deviceCount: 20,
    scooterIncome: 2.5,
    dailyIncome: 50.0,
    features: ["20 جهاز سكوتر أسطول", "دخل السكوتر: 2.50 USDT", "إجمالي الدخل: 50.00 USDT"],
  },
  {
    _id: "e6",
    name: "E6",
    modelName: "E6",
    price: 2000,
    deviceCount: 40,
    scooterIncome: 2.5,
    dailyIncome: 100.0,
    features: ["40 جهاز سكوتر طاقة", "دخل السكوتر: 2.50 USDT", "إجمالي الدخل: 100.00 USDT"],
  },
  {
    _id: "e7",
    name: "E7",
    modelName: "E7",
    price: 5000,
    deviceCount: 100,
    scooterIncome: 2.5,
    dailyIncome: 250.0,
    features: ["100 جهاز سكوتر أسطول رئاسي", "دخل السكوتر: 2.50 USDT", "إجمالي الدخل: 250.00 USDT"],
  },
];

const TIER_MAPPINGS = {
  50: { modelName: "E1", deviceCount: 1, scooterIncome: 2.5, dailyIncome: 2.5 },
  100: { modelName: "E2", deviceCount: 2, scooterIncome: 2.5, dailyIncome: 5.0 },
  200: { modelName: "E3", deviceCount: 4, scooterIncome: 2.5, dailyIncome: 10.0 },
  500: { modelName: "E4", deviceCount: 10, scooterIncome: 2.5, dailyIncome: 25.0 },
  1000: { modelName: "E5", deviceCount: 20, scooterIncome: 2.5, dailyIncome: 50.0 },
  2000: { modelName: "E6", deviceCount: 40, scooterIncome: 2.5, dailyIncome: 100.0 },
  5000: { modelName: "E7", deviceCount: 100, scooterIncome: 2.5, dailyIncome: 250.0 },
};

const resolveScooterData = (scooter) => {
  const price = Number(scooter?.price || 50);
  if (TIER_MAPPINGS[price]) {
    return {
      price,
      modelName: TIER_MAPPINGS[price].modelName,
      deviceCount: TIER_MAPPINGS[price].deviceCount,
      scooterIncome: TIER_MAPPINGS[price].scooterIncome,
      dailyIncome: TIER_MAPPINGS[price].dailyIncome,
    };
  }
  const dailyIncome = Number((price * 0.05).toFixed(2));
  const deviceCount = Math.max(1, Math.round(price / 50));
  const scooterIncome = 2.5;
  const modelName =
    scooter?.modelName && !["E2", "E2 Scooter"].includes(scooter.modelName)
      ? scooter.modelName
      : `E${Math.min(7, Math.max(1, Math.round(price / 50)))}`;

  return { price, modelName, deviceCount, scooterIncome, dailyIncome };
};

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
          ? `تم استئجار سكوتر ${planToConfirm.modelName || planToConfirm.name} بنجاح! توجه لشاشة RIDE لبدء التشغيل.`
          : `Scooter ${planToConfirm.modelName || planToConfirm.name} leased successfully! Head to RIDE to power on.`
      );
      setPlanToConfirm(null);
    } catch (err) {
      toast.error(formatApiError(err, locale));
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
          const resolved = resolveScooterData(scooter);
          const modelName = resolved.modelName;
          const deviceCount = resolved.deviceCount;
          const price = resolved.price;
          const dailyIncome = resolved.dailyIncome;
          const scooterIncome = resolved.scooterIncome;

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
                onClick={() => setPlanToConfirm({ ...scooter, ...resolved })}
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
