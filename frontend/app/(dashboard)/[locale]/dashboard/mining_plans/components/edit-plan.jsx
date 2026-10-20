"use client";

import { useEffect, useMemo } from "react";
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
import { useUpdateAdminPlanMutation } from "@/api/services/admin/plans/plans.query";

export default function EditPlanDialog({ open, onOpenChange, plan }) {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";

  const schema = useMemo(
    () =>
      z.object({
        price: z.coerce
          .number()
          .positive(
            isArabic
              ? "السعر يجب أن يكون أكبر من 0."
              : "Price must be greater than 0.",
          ),
        isPopular: z.boolean().default(false),
      }),
    [isArabic],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      price: 0,
      isPopular: false,
    },
  });

  useEffect(() => {
    if (!open || !plan) return;
    form.reset({
      price: Number(plan.price ?? 0),
      isPopular: Boolean(plan.isPopular),
    });
  }, [form, open, plan]);

  const { mutate, isPending } = useUpdateAdminPlanMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم تعديل الخطة بنجاح." : "Plan updated successfully.");
      onOpenChange(false);
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        (isArabic ? "تعذر تعديل الخطة." : "Failed to update plan.");
      toast.error(message);
    },
  });

  const onSubmit = (values) => {
    if (!plan?.planId) return;

    mutate({
      planId: plan.planId,
      payload: {
        price: values.price,
        isPopular: values.isPopular,
      },
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
        className={`border-white/10 bg-[#202021] text-white sm:max-w-md ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle>{isArabic ? "تعديل الخطة" : "Edit Plan"}</DialogTitle>
          <DialogDescription className="text-white/55">
            {isArabic
              ? "يمكنك تعديل السعر وحالة الشعبية فقط."
              : "You can update price and popular status only."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <div className="text-sm text-white/80">{isArabic ? "السعر" : "Price"}</div>
            <Input type="number" step="0.01" {...register("price")} />
            {errors.price ? (
              <p className="text-xs text-[#ef4444]">{errors.price.message}</p>
            ) : null}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input type="checkbox" {...register("isPopular")} />
            <span>{isArabic ? "خطة شائعة" : "Popular Plan"}</span>
          </label>

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
            <Button type="submit" disabled={isPending || !plan?.planId}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? "جارٍ التحديث..." : "Updating..."}
                </>
              ) : isArabic ? (
                "حفظ التعديل"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
