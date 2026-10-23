"use client";

import { useMemo, useState } from "react";
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
import { CheckCircle, Crown } from "lucide-react";
import SupportButton from "@/components/site/SupportButton";
import { motion } from "framer-motion";
import {
  useActivePlansQuery,
  useSubscribeToPlanMutation,
} from "@/api/services/user/plans/plans.query";
import { toast } from "sonner";
import { PAYOUT_INTERVAL_DAYS, PAYOUT_PERCENT } from "@/lib/mining-payout";

export default function MiningPlansPage() {
  const { t, locale } = useTranslations();
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [planToConfirm, setPlanToConfirm] = useState(null);
  const isArabic = locale === "ar";
  const confirmText = isArabic
    ? {
        title: "تأكيد الاشتراك بالخطة",
        description: "هل أنت متأكد أنك تريد الاشتراك في هذه الخطة؟",
        cancel: "إلغاء",
        confirm: "تأكيد الاشتراك",
        confirming: "جاري الاشتراك...",
      }
    : {
        title: "Confirm Plan Subscription",
        description: "Are you sure you want to subscribe to this plan?",
        cancel: "Cancel",
        confirm: "Confirm Subscription",
        confirming: "Subscribing...",
      };
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    useGrouping: true,
  });
  const containerVar = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.12 },
    },
  };
  const itemVar = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  const {
    data: plansResponse,
    isLoading,
    isError,
    error: plansError,
  } = useActivePlansQuery({
    activeOnly: true,
  });
  const subscribeMutation = useSubscribeToPlanMutation();

  const sourcePlans = useMemo(() => {
    const candidates = [
      plansResponse?.data?.data,
      plansResponse?.data?.plans,
      plansResponse?.data,
      plansResponse?.plans,
      plansResponse,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }

    return [];
  }, [plansResponse]);

  const gradientPalette = [
    "from-[#0b0f1a] to-[#132038]",
    "from-[#1a1400] to-[#2b2205]",
    "from-[#110b1a] to-[#231a35]",
    "from-[#11140d] to-[#21311b]",
  ];

  const plans = sourcePlans.map((plan, index) => ({
    id: plan._id || plan.planId || `${plan.name}-${index}`,
    title: plan.name || "--",
    price: Number(plan.price || 0),
    hashrate: plan.hashrate
      ? `${plan.hashrate} ${plan.hashrateUnit || "TH/s"}`
      : `-- ${plan.hashrateUnit || "TH/s"}`,
    roi: `${PAYOUT_PERCENT}% / ${PAYOUT_INTERVAL_DAYS} ${
      locale === "ar" ? "أيام" : "days"
    }`,
    duration:
      plan.durationDays != null
        ? `${plan.durationDays} ${locale === "ar" ? "يوم" : "days"}`
        : "--",
    gradient: gradientPalette[index % gradientPalette.length],
    features:
      Array.isArray(plan.features) && plan.features.length > 0
        ? plan.features
        : [
            locale === "ar"
              ? "خطة تعدين فعالة"
              : "Active mining plan",
          ],
    popular: Boolean(plan.isPopular),
  }));

  const arrangedPlans = useMemo(() => {
    if (plans.length <= 1) return plans;

    const popularIndex = plans.findIndex((plan) => plan.popular);
    if (popularIndex === -1) return plans;

    const popularPlan = plans[popularIndex];
    const rest = plans.filter((_, index) => index !== popularIndex);

    const middleIndex = Math.floor(rest.length / 2);
    const reordered = [...rest];
    reordered.splice(middleIndex, 0, popularPlan);
    return reordered;
  }, [plans]);

  const handleSubscribe = async (planId) => {
    if (!planId || subscribeMutation.isPending) return;

    try {
      setSubscribingPlanId(planId);
      await subscribeMutation.mutateAsync(planId);
      toast.success(
        locale === "ar"
          ? "تم الاشتراك في الخطة بنجاح"
          : "Plan subscribed successfully",
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (locale === "ar"
          ? "تعذر الاشتراك في الخطة"
          : "Failed to subscribe to plan");
      toast.error(message);
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const handleOpenSubscribeDialog = (plan) => {
    if (!plan || subscribeMutation.isPending) return;
    setPlanToConfirm(plan);
  };

  const handleConfirmSubscribe = async () => {
    if (!planToConfirm?.id) return;
    await handleSubscribe(planToConfirm.id);
    setPlanToConfirm(null);
  };

  return (
    <motion.div
      className="min-h-screen p-6"
      initial="hidden"
      animate="visible"
      variants={containerVar}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div className="mb-8 text-center" variants={itemVar}>
          <motion.h1 className="text-3xl font-bold text-white">
            {t("mining_plans.title")}
          </motion.h1>
          <motion.p className="text-white/70 mt-2" variants={itemVar}>
            {t("mining_plans.intro")}
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="mb-6 text-center text-sm text-white/70">
            {locale === "ar"
              ? "جاري تحميل الخطط..."
              : "Loading plans..."}
          </div>
        ) : null}

        {isError ? (
          <div className="mb-6 text-center text-sm text-red-300">
            {plansError?.response?.data?.message ||
              (locale === "ar" ? "تعذر تحميل الخطط." : "Failed to load plans.")}
          </div>
        ) : null}

        {!isLoading && !isError && plans.length === 0 ? (
          <div className="mb-6 text-center text-sm text-white/70">
            {locale === "ar"
              ? "لا توجد خطط متاحة."
              : "No plans available."}
          </div>
        ) : null}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVar}
        >
          {arrangedPlans.map((p) => (
            <motion.div key={p.id} variants={itemVar} className="h-full">
              <Card
                className={`flex h-full rounded-2xl border bg-gradient-to-b text-white ${
                  p.popular
                    ? "min-h-[490px] border-primary/50 shadow-[0_18px_60px_rgba(255,209,0,0.18)] md:-translate-y-2"
                    : "min-h-[455px] border-gray-600/40"
                } ${p.gradient}`}
              >
                <CardContent className="flex h-full w-full flex-col p-6">
                  {p.popular ? (
                    <div className="mb-4 flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-black text-xs font-semibold">
                        <Crown className="w-3 h-3" />
                        {t("mining_plans.popular")}
                      </span>
                    </div>
                  ) : null}
                  <div className="mb-4">
                    <div className="text-lg font-semibold">{p.title}</div>
                    <div className="text-3xl font-bold mt-1">
                      {nf.format(p.price)} USDT
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-6">
                    <div className="text-white/70">
                      {t("mining_plans.labels.hashrate")}
                    </div>
                    <div className="text-white font-medium">{p.hashrate}</div>
                    <div className="text-white/70">
                      {t("mining_plans.labels.estRoi")}
                    </div>
                    <div className="text-green-400 font-medium">{p.roi}</div>
                    <div className="text-white/70">
                      {t("mining_plans.labels.duration")}
                    </div>
                    <div className="text-white font-medium">{p.duration}</div>
                  </div>
                  <div className="space-y-2 mb-6">
                    {p.features.map((f, featureIndex) => (
                      <div
                        key={`${p.id}-${featureIndex}-${f}`}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-white/90">{f}</span>
                      </div>
                    ))}
                  </div>
                  {p.popular ? (
                    <Button
                      style={{
                        borderColor: "var(--color-primary)",
                        width: "100%",
                      }}
                      className="mt-auto w-full"
                      onClick={() => handleOpenSubscribeDialog(p)}
                      disabled={subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending && subscribingPlanId === p.id
                        ? locale === "ar"
                          ? "جاري الاشتراك..."
                          : "Subscribing..."
                        : t("mining_plans.purchase")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-auto w-full"
                      onClick={() => handleOpenSubscribeDialog(p)}
                      disabled={subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending && subscribingPlanId === p.id
                        ? locale === "ar"
                          ? "جاري الاشتراك..."
                          : "Subscribing..."
                        : t("mining_plans.purchase")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <Dialog
        open={Boolean(planToConfirm)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !subscribeMutation.isPending) {
            setPlanToConfirm(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {confirmText.title}
            </DialogTitle>
            <DialogDescription>
              {confirmText.description}
              {planToConfirm?.title ? ` (${planToConfirm.title})` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPlanToConfirm(null)}
              disabled={subscribeMutation.isPending}
              className="text-white"
            >
              {confirmText.cancel}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSubscribe}
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending
                ? confirmText.confirming
                : confirmText.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SupportButton className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50" />
    </motion.div>
  );
}
