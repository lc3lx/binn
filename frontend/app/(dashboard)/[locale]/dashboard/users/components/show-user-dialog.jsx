"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/hooks/useTranslations";
import { useAdminUserDetailsQuery } from "@/api/services/admin/users-management/users-management.query";
import { formatLocalizedDate } from "@/lib/format-localized-date";
import Image from "next/image";
import { IMAGEURL } from "@/api/config";

const copy = {
  en: {
    title: "User Details",
    subtitle:
      "Review account info, KYC documents, and recent verification details.",
    loading: "Loading user details...",
    error: "Failed to load user details.",
    labels: {
      userCode: "User Code",
      name: "Name",
      email: "Email",
      role: "Role",
      balance: "Balance",
      status: "Status",
      kycStatus: "KYC Status",
      registeredAt: "Registered At",
      updatedAt: "Updated At",
      activePlans: "Active Plans",
      submittedAt: "KYC Submitted",
      reviewedAt: "KYC Reviewed",
      reviewedBy: "Reviewed By",
      rejectionReason: "Rejection Reason",
      frontImage: "Front Document",
      backImage: "Back Document",
      none: "Not available",
      noReason: "No rejection reason",
    },
    status: {
      active: "Active",
      blocked: "Blocked",
      pending: "Pending",
      approved: "Approved",
      verified: "Verified",
      submitted: "Submitted",
      not_submitted: "Not Submitted",
      rejected: "Rejected",
      admin: "Admin",
      user: "User",
      plan: "Plan",
      subscribedAt: "Subscribed",
      expiresAt: "Expires",
      hashrate: "Hashrate",
      duration: "Duration",
      price: "Price",
      plansTitle: "Plan subscriptions",
      noPlans: "No active plans",
    },
  },
  ar: {
    title: "تفاصيل المستخدم",
    subtitle: "راجع بيانات الحساب ومستندات التوثيق وتفاصيل المراجعة الأخيرة.",
    loading: "جاري تحميل تفاصيل المستخدم...",
    error: "تعذر تحميل تفاصيل المستخدم.",
    labels: {
      userCode: "كود المستخدم",
      name: "الاسم",
      email: "البريد الإلكتروني",
      role: "الدور",
      balance: "الرصيد",
      status: "الحالة",
      kycStatus: "حالة التوثيق",
      registeredAt: "تاريخ التسجيل",
      updatedAt: "آخر تحديث",
      activePlans: "الخطط النشطة",
      submittedAt: "تاريخ إرسال التوثيق",
      reviewedAt: "تاريخ المراجعة",
      reviewedBy: "تمت المراجعة بواسطة",
      rejectionReason: "سبب الرفض",
      frontImage: "صورة الواجهة الأمامية",
      backImage: "صورة الواجهة الخلفية",
      none: "غير متوفر",
      noReason: "لا يوجد سبب رفض",
    },
    status: {
      active: "نشط",
      blocked: "محظور",
      pending: "قيد الانتظار",
      approved: "مقبول",
      verified: "موثق",
      submitted: "تم الإرسال",
      not_submitted: "غير مرسل",
      rejected: "مرفوض",
      admin: "أدمن",
      user: "مستخدم",
      plan: "الخطة",
      subscribedAt: "تاريخ الاشتراك",
      expiresAt: "تاريخ الانتهاء",
      hashrate: "قوة الهاش",
      duration: "المدة",
      price: "السعر",
      plansTitle: "الخطط المشترَك بها",
      noPlans: "لا يوجد خطط نشطة",
    },
  },
};

const badgeStyles = {
  active: "bg-primary/20 text-primary",
  approved: "bg-primary/20 text-primary",
  verified: "bg-primary/20 text-primary",
  pending: "bg-[#4b3f15] text-primary",
  submitted: "bg-[#4b3f15] text-primary",
  blocked: "bg-[#3b1718] text-[#ef4444]",
  rejected: "bg-[#3b1718] text-[#ef4444]",
  not_submitted: "bg-white/10 text-white/65",
};

function formatCurrency(value, locale) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "$0";

  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function DetailRow({ label, value, className = "", isArabic = false }) {
  return (
    <div
      className={`rounded-lg border border-white/10 bg-sidebar p-3 ${
        isArabic ? "text-right" : "text-left"
      }`}
    >
      <div className="text-[11px] text-white/45">{label}</div>
      <div className={`mt-1 text-sm font-medium text-white ${className}`}>
        {value}
      </div>
    </div>
  );
}

export default function ShowUserDialog({ userId, open, onOpenChange }) {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const text = copy[locale] || copy.en;
  const planText =
    locale === "ar"
      ? {
          title: "الخطط المشترَك بها",
          price: "السعر",
          hashrate: "قوة الهاش",
          duration: "المدة",
          subscribed: "تاريخ الاشتراك",
          expires: "تاريخ الانتهاء",
          noPlans: "لا يوجد خطط نشطة",
        }
      : {
          title: "Plan subscriptions",
          price: "Price",
          hashrate: "Hashrate",
          duration: "Duration",
          subscribed: "Subscribed",
          expires: "Expires",
          noPlans: "No active plans",
        };
  const { data, isLoading, isError } = useAdminUserDetailsQuery(userId, {
    enabled: open && Boolean(userId),
  });

  const user = data?.data ?? data ?? null;
  const status = String(user?.status || "pending").toLowerCase();
  const kycStatus = String(user?.kycStatus || "not_submitted").toLowerCase();
  const role = String(user?.role || "user").toLowerCase();
  const getImageUrl = (fileName) => {
    if (!fileName) return null;
    const base = IMAGEURL?.replace(/\/$/, "") || "";
    const suffix = fileName.startsWith("/") ? fileName : `/${fileName}`;
    return `${base}${suffix}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto border-white/10 bg-[#202021] text-white sm:max-w-3xl ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle className="pt-5">{text.title}</DialogTitle>
          <DialogDescription className="text-white/45">
            {text.subtitle}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="rounded-lg border border-white/10 bg-[#2a2a2c] p-6 text-center text-sm text-white/55">
            {text.loading}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-[#ef4444]/20 bg-[#351618] p-6 text-center text-sm text-[#ef9a9a]">
            {text.error}
          </div>
        ) : user ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailRow
                label={text.labels.userCode}
                value={user.userCode || text.labels.none}
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.name}
                value={user.name || text.labels.none}
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.email}
                value={user.email || text.labels.none}
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.role}
                value={text.status[role] || role}
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.balance}
                value={formatCurrency(user.balance ?? 0, locale)}
                className="text-primary"
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.activePlans}
                value={String(user.activePlanSubscriptionsCount ?? 0)}
                isArabic={isArabic}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div
                className={`rounded-lg border border-white/10 bg-sidebar p-4 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                <div className="text-[11px] text-white/45">
                  {text.labels.status}
                </div>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${badgeStyles[status] || badgeStyles.pending}`}
                >
                  {text.status[status] || status}
                </span>
              </div>

              <div
                className={`rounded-lg border border-white/10 bg-sidebar p-4 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                <div className="text-[11px] text-white/45">
                  {text.labels.kycStatus}
                </div>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${badgeStyles[kycStatus] || badgeStyles.not_submitted}`}
                >
                  {text.status[kycStatus] || kycStatus}
                </span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <DetailRow
                label={text.labels.registeredAt}
                value={formatLocalizedDate(user.createdAt, locale, {
                  includeTime: true,
                })}
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.updatedAt}
                value={formatLocalizedDate(user.updatedAt, locale, {
                  includeTime: true,
                })}
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.submittedAt}
                value={formatLocalizedDate(
                  user.kycDocuments?.submittedAt,
                  locale,
                  {
                    includeTime: true,
                  },
                )}
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.reviewedAt}
                value={formatLocalizedDate(user.kycReview?.reviewedAt, locale, {
                  includeTime: true,
                })}
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.reviewedBy}
                value={user.kycReview?.reviewedBy || text.labels.none}
                isArabic={isArabic}
              />
              <DetailRow
                label={text.labels.rejectionReason}
                value={user.kycReview?.rejectionReason || text.labels.noReason}
                isArabic={isArabic}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {getImageUrl(user.kycDocuments?.frontImage) ? (
                <div className="rounded-lg border border-white/10 bg-sidebar p-3">
                  <div className="text-[11px] text-white/45">
                    {text.labels.frontImage}
                  </div>
                  <div className="mt-2 overflow-hidden rounded-md border border-white/10 bg-black/40">
                    <Image
                      src={getImageUrl(user.kycDocuments.frontImage)}
                      alt={text.labels.frontImage}
                      width={520}
                      height={360}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}

              {getImageUrl(user.kycDocuments?.backImage) ? (
                <div className="rounded-lg border border-white/10 bg-sidebar p-3">
                  <div className="text-[11px] text-white/45">
                    {text.labels.backImage}
                  </div>
                  <div className="mt-2 overflow-hidden rounded-md border border-white/10 bg-black/40">
                    <Image
                      src={getImageUrl(user.kycDocuments.backImage)}
                      alt={text.labels.backImage}
                      width={520}
                      height={360}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">
                {planText.title}
              </div>
              {Array.isArray(user.planSubscriptions) &&
              user.planSubscriptions.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {user.planSubscriptions.map((sub) => (
                    <div
                      key={sub._id || sub.plan?._id || sub.planName}
                      className={`rounded-lg border border-white/10 bg-sidebar p-4 ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">
                        {sub.planName || sub.plan?.name || text.status.plan}
                      </div>
                      <div className="mt-2 grid gap-1 text-[12px] text-white/70">
                        <div>
                          {planText.price}:{" "}
                          <span className="font-medium text-primary">
                            {formatCurrency(sub.plan?.price ?? 0, locale)}
                          </span>
                        </div>
                        <div>
                          {planText.hashrate}: {sub.plan?.hashrate}{" "}
                          {sub.plan?.hashrateUnit || "TH/s"}
                        </div>
                        <div>
                          {planText.duration}: {sub.plan?.durationDays}d
                        </div>
                        <div>
                          {planText.subscribed}:{" "}
                          {formatLocalizedDate(sub.subscribedAt, locale, {
                            includeTime: true,
                          })}
                        </div>
                        <div>
                          {planText.expires}:{" "}
                          {formatLocalizedDate(sub.expiresAt, locale, {
                            includeTime: true,
                          })}
                        </div>
                        <div>
                          {text.labels.status}:{" "}
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeStyles[sub.status] || badgeStyles.pending}`}
                          >
                            {text.status[sub.status] || sub.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-sidebar p-3 text-sm text-white/55">
                  {text.status.noPlans || planText.noPlans || text.labels.none}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
