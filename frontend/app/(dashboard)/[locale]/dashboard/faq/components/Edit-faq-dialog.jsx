"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { editFaqSchema } from "./validation";
import { useUpdateFaqMutation } from "@/api/services/admin/faq/faq.query";

export default function EditFaqDialog({
  open,
  onOpenChange,
  faq,
  isArabic = false,
}) {
  const form = useForm({
    resolver: zodResolver(editFaqSchema),
    defaultValues: {
      isActive: Boolean(faq?.isActive),
    },
  });

  const { mutate, isPending } = useUpdateFaqMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم تحديث الحالة" : "FAQ status updated");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          (isArabic ? "تعذر تحديث الحالة" : "Failed to update FAQ"),
      );
    },
  });

  useEffect(() => {
    form.reset({ isActive: Boolean(faq?.isActive) });
  }, [faq, open, form]);

  const onSubmit = (values) => {
    if (!faq?._id) return;
    mutate({ faqId: faq._id, payload: { isActive: values.isActive } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`border-white/10 bg-[#202021] text-white sm:max-w-md ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle>{isArabic ? "تعديل الحالة" : "Edit FAQ Status"}</DialogTitle>
          <DialogDescription className="text-white/55">
            {faq?.question || "--"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <label className="inline-flex items-center gap-2 text-sm text-white/85">
            <input
              type="checkbox"
              {...form.register("isActive")}
              className="h-4 w-4 rounded border-white/20 bg-transparent accent-primary"
            />
            {isArabic ? "مفعل" : "Active"}
          </label>

          <DialogFooter className={isArabic ? "sm:flex-row-reverse" : ""}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/15 bg-[#2a2a2c] text-white/85 hover:bg-[#303033] hover:text-white"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? "جاري التحديث..." : "Updating..."}
                </>
              ) : isArabic ? (
                "تحديث"
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

