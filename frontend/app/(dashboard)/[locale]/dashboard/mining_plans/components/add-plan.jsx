"use client";

import { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/hooks/useTranslations";
import { useCreateAdminPlanMutation } from "@/api/services/admin/plans/plans.query";

export default function AddPlanDialog({ open, onOpenChange }) {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, isArabic ? "الاسم مطلوب." : "Name is required."),
        price: z.coerce.number().positive(isArabic ? "السعر يجب أن يكون أكبر من 0." : "Price must be greater than 0."),
        currency: z.string().trim().min(2),
        hashrate: z.coerce.number().positive(isArabic ? "الهاش ريت يجب أن يكون أكبر من 0." : "Hashrate must be greater than 0."),
        hashrateUnit: z.string().trim().min(2),
        roiMinPercent: z.coerce.number().min(0),
        roiMaxPercent: z.coerce.number().min(0),
        durationDays: z.coerce.number().int().positive(isArabic ? "المدة يجب أن تكون أكبر من 0." : "Duration must be greater than 0."),
        featuresText: z.string().trim().min(1, isArabic ? "أدخل ميزة واحدة على الأقل." : "Enter at least one feature."),
        isPopular: z.boolean().default(false),
        isActive: z.boolean().default(true),
      }),
    [isArabic],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      price: 100,
      currency: "USDT",
      hashrate: 10,
      hashrateUnit: "TH/s",
      roiMinPercent: 30,
      roiMaxPercent: 42,
      durationDays: 30,
      featuresText: "Daily payouts\nInstant activation",
      isPopular: false,
      isActive: true,
    },
  });

  const { mutate, isPending } = useCreateAdminPlanMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم إنشاء الخطة بنجاح." : "Plan created successfully.");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        (isArabic ? "تعذر إنشاء الخطة." : "Failed to create plan.");
      toast.error(message);
    },
  });

  const onSubmit = (values) => {
    const features = values.featuresText
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    mutate({
      name: values.name.trim(),
      price: values.price,
      currency: values.currency.trim(),
      hashrate: values.hashrate,
      hashrateUnit: values.hashrateUnit.trim(),
      roiMinPercent: values.roiMinPercent,
      roiMaxPercent: values.roiMaxPercent,
      durationDays: values.durationDays,
      features,
      isPopular: values.isPopular,
      isActive: values.isActive,
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto border-white/10 bg-[#202021] text-white sm:max-w-2xl ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle>{isArabic ? "إضافة خطة جديدة" : "Add New Plan"}</DialogTitle>
          <DialogDescription className="text-white/55">
            {isArabic
              ? "أدخل تفاصيل الخطة كما ستُرسل إلى الباك إند."
              : "Enter the plan details to create it."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="text-sm text-white/80">{isArabic ? "اسم الخطة" : "Plan Name"}</div>
              <Input {...register("name")} />
              {errors.name ? <p className="text-xs text-[#ef4444]">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-white/80">{isArabic ? "السعر" : "Price"}</div>
              <Input type="number" step="0.01" {...register("price")} />
              {errors.price ? <p className="text-xs text-[#ef4444]">{errors.price.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-white/80">{isArabic ? "العملة" : "Currency"}</div>
              <Input {...register("currency")} />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-white/80">{isArabic ? "المدة (يوم)" : "Duration (days)"}</div>
              <Input type="number" {...register("durationDays")} />
              {errors.durationDays ? <p className="text-xs text-[#ef4444]">{errors.durationDays.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-white/80">{isArabic ? "الهاش ريت" : "Hashrate"}</div>
              <Input type="number" step="0.01" {...register("hashrate")} />
              {errors.hashrate ? <p className="text-xs text-[#ef4444]">{errors.hashrate.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-white/80">{isArabic ? "وحدة الهاش" : "Hashrate Unit"}</div>
              <Input {...register("hashrateUnit")} />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-white/80">{isArabic ? "أقل ROI %" : "ROI Min %"}</div>
              <Input type="number" step="0.01" {...register("roiMinPercent")} />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-white/80">{isArabic ? "أعلى ROI %" : "ROI Max %"}</div>
              <Input type="number" step="0.01" {...register("roiMaxPercent")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm text-white/80">
              {isArabic ? "المزايا (كل سطر ميزة)" : "Features (one per line)"}
            </div>
            <textarea
              {...register("featuresText")}
              rows={4}
              className="w-full resize-none rounded-md border border-white/15 bg-[#2a2a2c] p-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-primary/40"
            />
            {errors.featuresText ? (
              <p className="text-xs text-[#ef4444]">{errors.featuresText.message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                {...register("isPopular")}
              />
              <span>{isArabic ? "خطة شائعة" : "Popular Plan"}</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                {...register("isActive")}
              />
              <span>{isArabic ? "الخطة مفعلة" : "Plan Active"}</span>
            </label>
          </div>

          <DialogFooter
            className={`gap-2 ${isArabic ? "sm:flex-row-reverse" : "sm:flex-row"}`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="border-white/15 bg-[#2a2a2c] text-white/85 hover:bg-[#303033] hover:text-white"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? "جارٍ الإنشاء..." : "Creating..."}
                </>
              ) : isArabic ? (
                "إنشاء الخطة"
              ) : (
                "Create Plan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
