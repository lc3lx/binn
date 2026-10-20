"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, Pickaxe, Save, Trash2, Users } from "lucide-react";
import {
  useAdminPlansManagementQuery,
  useDeleteAdminPlanMutation,
} from "@/api/services/admin/plans/plans.query";
import { useTranslations } from "@/hooks/useTranslations";
import AddPlanDialog from "./components/add-plan";
import EditPlanDialog from "./components/edit-plan";
import DeleteGlobal from "@/components/shared/delete-global";

const accentVariants = [
  { accent: "text-primary bg-primary/10", iconClass: "text-primary" },
  { accent: "text-[#3b82f6] bg-[#1a2640]", iconClass: "text-[#3b82f6]" },
  { accent: "text-[#f59e0b] bg-[#3a2b16]", iconClass: "text-[#f59e0b]" },
];

export default function AdminMiningPlansPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(null);

  const { data, isLoading, isError } = useAdminPlansManagementQuery({
    status: "all",
    search: "",
  });
  const { mutate: deletePlan, isPending: isDeletingPlan } =
    useDeleteAdminPlanMutation({
      onSuccess: () => {
        toast.success(
          isArabic ? "تم حذف الخطة بنجاح." : "Plan deleted successfully.",
        );
        setIsDeleteOpen(false);
        setDeletingPlan(null);
      },
      onError: (error) => {
        const message =
          error?.response?.data?.message ||
          (isArabic ? "تعذر حذف الخطة." : "Failed to delete plan.");
        toast.error(message);
      },
    });

  const payload = data ?? {};
  const summary = payload?.summary || payload?.data?.summary || {};
  const sourcePlans = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.data?.data)
      ? payload.data.data
      : [];

  const formattedPlans = sourcePlans.map((plan, index) => {
    const accent = accentVariants[index % accentVariants.length];
    return {
      id: plan.planId || plan._id || `${plan.name}-${index}`,
      planId: plan.planId || plan._id || null,
      name: plan.name || "--",
      priceValue: Number(plan.price || 0),
      price: `${Number(plan.price || 0).toLocaleString("en-US")} ${
        plan.currency || "USDT"
      }`,
      duration:
        plan.durationDays != null
          ? `${plan.durationDays} ${isArabic ? "يوم" : "days"}`
          : "--",
      dailyRate:
        plan.dailyRatePercent != null ? `${plan.dailyRatePercent}%` : "--",
      totalReturn:
        plan.totalReturnPercent != null ? `${plan.totalReturnPercent}%` : "--",
      hashrate:
        plan.hashrate != null
          ? `${plan.hashrate} ${plan.hashrateUnit || "TH/s"}`
          : `-- ${plan.hashrateUnit || "TH/s"}`,
      subscribers: `${Number(plan.totalSubscribers || 0).toLocaleString(
        "en-US",
      )} ${isArabic ? "مشترك" : "subscribers"}`,
      active: Boolean(plan.isActive),
      isPopular: Boolean(plan.isPopular),
      accent: accent.accent,
      iconClass: accent.iconClass,
    };
  });

  const detailItems = (plan) => [
    { label: isArabic ? "المدة" : "Duration", value: plan.duration },
    {
      label: isArabic ? "النسبة اليومية" : "Daily Rate",
      value: plan.dailyRate,
    },
    {
      label: isArabic ? "العائد الكلي" : "Total Return",
      value: plan.totalReturn,
    },
    { label: isArabic ? "الهاش ريت" : "Hashrate", value: plan.hashrate },
  ];

  return (
    <div
      className={`min-h-screen p-4 text-white sm:p-6 ${
        isArabic ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold leading-none text-white">
              {isArabic ? "خطط التعدين" : "Mining Plans"}
            </h1>
            <p className="mt-2 text-sm text-white/45">
              {isLoading
                ? isArabic
                  ? "جاري تحميل الخطط..."
                  : "Loading plans..."
                : `${Number(
                    summary.totalPlans || formattedPlans.length,
                  ).toLocaleString("en-US")} ${
                    isArabic ? "خطة" : "plans"
                  } - ${Number(summary.totalSubscribers || 0).toLocaleString(
                    "en-US",
                  )} ${isArabic ? "إجمالي المشتركين" : "total subscribers"}`}
            </p>
          </div>

          <Button type="button" onClick={() => setIsAddPlanOpen(true)}>
            <Save className="mr-2 h-4 w-4" />
            {isArabic ? "إضافة خطة" : "Add plan"}
          </Button>
        </div>

        {isError ? (
          <div className="rounded-[10px] border border-[#ef4444]/30 bg-[#351618] p-4 text-sm text-[#ef9a9a]">
            {isArabic ? "تعذر تحميل الخطط." : "Failed to load plans."}
          </div>
        ) : null}

        {!isLoading && formattedPlans.length === 0 ? (
          <div className="rounded-[10px] border border-white/10 bg-[#242426] p-4 text-sm text-white/60">
            {isArabic ? "لا توجد خطط." : "No plans found."}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {formattedPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-[10px] border border-white/5 bg-[#242426] p-4 shadow-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full ${plan.accent}`}
                  >
                    <Pickaxe className={`h-4 w-4 ${plan.iconClass}`} />
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {plan.name}
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    plan.active
                      ? "bg-primary/10 text-primary"
                      : "bg-[#3a1618] text-[#ef4444]"
                  }`}
                >
                  {plan.active
                    ? isArabic
                      ? "نشط"
                      : "Active"
                    : isArabic
                      ? "غير نشط"
                      : "Inactive"}
                </span>
              </div>

              <div className="mt-6 text-[34px] font-bold leading-none text-white">
                {plan.price}
              </div>

              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {detailItems(plan).map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[10px] border border-white/15 bg-[#2d2d2f] px-4 py-3"
                    >
                      <div className="text-[11px] text-white/35">
                        {item.label}
                      </div>
                      <div className="mt-2 text-base font-semibold text-white">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-xs text-white/45">
                  <Users className={`h-3.5 w-3.5 ${plan.iconClass}`} />
                  <span>{plan.subscribers}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="text-primary transition-colors hover:text-primary/80"
                    aria-label={`Edit ${plan.name}`}
                    onClick={() => {
                      setEditingPlan({
                        planId: plan.planId,
                        price: plan.priceValue,
                        isPopular: plan.isPopular,
                      });
                      setIsEditPlanOpen(true);
                    }}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="text-[#ef4444]  transition-colors hover:text-[#f87171]"
                    aria-label={`Delete ${plan.name}`}
                    onClick={() => {
                      setDeletingPlan({ planId: plan.planId, name: plan.name });
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddPlanDialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen} />
      <EditPlanDialog
        open={isEditPlanOpen}
        plan={editingPlan}
        onOpenChange={(open) => {
          setIsEditPlanOpen(open);
          if (!open) setEditingPlan(null);
        }}
      />
      <DeleteGlobal
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeletingPlan(null);
        }}
        onConfirm={() => {
          if (!deletingPlan?.planId || isDeletingPlan) return;
          deletePlan({ planId: deletingPlan.planId });
        }}
        isLoading={isDeletingPlan}
        isArabic={isArabic}
        title={isArabic ? "حذف الخطة" : "Delete Plan"}
        description={
          isArabic
            ? `هل أنت متأكد من حذف خطة "${deletingPlan?.name || ""}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${deletingPlan?.name || ""}"? This action cannot be undone.`
        }
        confirmText={isArabic ? "تأكيد الحذف" : "Confirm Delete"}
        cancelText={isArabic ? "إلغاء" : "Cancel"}
      />
    </div>
  );
}
