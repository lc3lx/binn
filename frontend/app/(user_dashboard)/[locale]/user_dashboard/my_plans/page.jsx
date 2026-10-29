"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useMyPlanSubscriptionsQuery } from "@/api/services/user/mining_plans/mining_plans.query";

export default function MyPlansPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";

  const text = isArabic
    ? {
        title: "سكوتراتي المؤجرة",
        subtitle: "جميع طرازات السكوترات النشطة وسجل التأجير",
        walletBalance: "رصيد المحفظة",
        currentPlan: "السكوتر النشط حالياً",
        subscriptions: "سجل السكوترات المؤجرة",
        planName: "طراز السكوتر",
        status: "الحالة",
        subscribedAt: "تاريخ الاستئجار",
        expiresAt: "تاريخ الانتهاء",
        noCurrentPlan: "لا يوجد سكوتر نشط حالياً",
        noSubscriptions: "لا توجد سكوترات مؤجرة حالياً",
        active: "نشط",
        inactive: "غير نشط",
      }
    : {
        title: "My Leased Scooters",
        subtitle: "Your active e-scooters and leasing history",
        walletBalance: "Wallet Balance",
        currentPlan: "Active Scooter",
        subscriptions: "Leased Scooters History",
        planName: "Scooter Model",
        status: "Status",
        subscribedAt: "Leased At",
        expiresAt: "Expires At",
        noCurrentPlan: "No active scooter",
        noSubscriptions: "No leased scooters found",
        active: "Active",
        inactive: "Inactive",
      };

  const { data, isLoading, isError } = useMyPlanSubscriptionsQuery();

  const payload = data?.data || {};
  const walletBalance = Number(payload?.walletBalance || 0);
  const currentPlan = payload?.currentPlan || null;
  const planSubscriptions = Array.isArray(payload?.planSubscriptions)
    ? payload.planSubscriptions
    : [];

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US", {
        maximumFractionDigits: 2,
      }),
    [isArabic],
  );

  const formatDate = (value) => {
    if (!value) return "--";
    return new Date(value).toLocaleString(isArabic ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const getStatus = (status) => {
    const s = String(status || "").toLowerCase();
    return s === "active" ? text.active : text.inactive;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{text.title}</h1>
            <p className="mt-1 text-sm text-white/65">{text.subtitle}</p>
          </div>
          <Link href={`/${locale}/user_dashboard/mining_plans`}>
            <Button className="bg-[#0c2a54] hover:bg-[#103569] text-white font-bold border border-blue-500/40 rounded-xl">
              <Zap className="w-4 h-4 mr-1 text-cyan-400" />
              {isArabic ? "ترقية / استئجار سكوتر جديد" : "Upgrade / Lease New Scooter"}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              {text.walletBalance}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${nf.format(walletBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">{text.currentPlan}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentPlan ? (
              <div className="grid grid-cols-1 gap-3 text-sm text-white/85 md:grid-cols-4">
                <div>
                  <div className="text-white/55">{text.planName}</div>
                  <div className="mt-1 font-semibold">{currentPlan.planName || "--"}</div>
                </div>
                <div>
                  <div className="text-white/55">{text.status}</div>
                  <div className="mt-1">
                    <span className="inline-flex rounded-md border border-primary/30 bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      {getStatus(currentPlan.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-white/55">{text.subscribedAt}</div>
                  <div className="mt-1 font-medium">{formatDate(currentPlan.subscribedAt)}</div>
                </div>
                <div>
                  <div className="text-white/55">{text.expiresAt}</div>
                  <div className="mt-1 font-medium">{formatDate(currentPlan.expiresAt)}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/65">{text.noCurrentPlan}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">{text.subscriptions}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-white/65">{isArabic ? "جاري التحميل..." : "Loading..."}</p>
            ) : null}

            {isError ? (
              <p className="text-sm text-red-300">
                {isArabic ? "تعذر تحميل الاشتراكات" : "Failed to load subscriptions"}
              </p>
            ) : null}

            {!isLoading && !isError && !planSubscriptions.length ? (
              <p className="text-sm text-white/65">{text.noSubscriptions}</p>
            ) : null}

            <div className="space-y-3">
              {planSubscriptions.map((sub) => (
                <div
                  key={sub._id || `${sub.plan}-${sub.subscribedAt}`}
                  className="rounded-lg border border-white/10 bg-black/20 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 text-sm text-white/85 md:grid-cols-4">
                    <div>
                      <div className="text-white/55">{text.planName}</div>
                      <div className="mt-1 font-semibold">{sub.planName || "--"}</div>
                    </div>
                    <div>
                      <div className="text-white/55">{text.status}</div>
                      <div className="mt-1">
                        <span className="inline-flex rounded-md border border-primary/30 bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          {getStatus(sub.status)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-white/55">{text.subscribedAt}</div>
                      <div className="mt-1 font-medium">{formatDate(sub.subscribedAt)}</div>
                    </div>
                    <div>
                      <div className="text-white/55">{text.expiresAt}</div>
                      <div className="mt-1 font-medium">{formatDate(sub.expiresAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
