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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFaqSchema } from "./validation";
import { useCreateFaqMutation } from "@/api/services/admin/faq/faq.query";

export default function AddFaqDialog({ open, onOpenChange, isArabic = false }) {
  const form = useForm({
    resolver: zodResolver(createFaqSchema),
    defaultValues: {
      question: "",
      answer: "",
      isActive: true,
    },
  });

  const { mutate, isPending } = useCreateFaqMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تمت إضافة السؤال بنجاح" : "FAQ created successfully");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          (isArabic ? "تعذر إضافة السؤال" : "Failed to create FAQ"),
      );
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = (values) => {
    mutate({
      ...values,
      category: "general",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`border-white/10 bg-[#202021] text-white sm:max-w-lg ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle>{isArabic ? "إضافة سؤال شائع" : "Add FAQ"}</DialogTitle>
          <DialogDescription className="text-white/55">
            {isArabic ? "أدخل بيانات السؤال والإجابة." : "Create a new FAQ item."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs text-white/70">{isArabic ? "السؤال" : "Question"}</p>
            <Input
              {...form.register("question")}
              className="border-white/10 bg-[#2a2a2c] text-white"
            />
            {form.formState.errors.question ? (
              <p className="text-xs text-red-400">
                {form.formState.errors.question.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-white/70">{isArabic ? "الإجابة" : "Answer"}</p>
            <textarea
              {...form.register("answer")}
              rows={4}
              className="w-full rounded-md border border-white/10 bg-[#2a2a2c] px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
            />
            {form.formState.errors.answer ? (
              <p className="text-xs text-red-400">{form.formState.errors.answer.message}</p>
            ) : null}
          </div>

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
                  {isArabic ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : isArabic ? (
                "إضافة"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

