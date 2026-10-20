"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
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
import { useAdjustUserWalletMutation } from "@/api/services/admin/users-management/users-management.query";

const copy = {
  en: {
    title: "Add Wallet Balance",
    description: "Add a manual balance amount to this user wallet.",
    amount: "Amount",
    note: "Note",
    amountPlaceholder: "100",
    notePlaceholder: "manual admin action",
    cancel: "Cancel",
    submit: "Add Balance",
    submitting: "Saving...",
    required: "Amount must be greater than 0.",
    success: "Balance added successfully.",
    error: "Failed to adjust wallet balance.",
  },
  ar: {
    title: "إضافة رصيد للمحفظة",
    description: "أضف مبلغًا يدويًا إلى رصيد محفظة المستخدم.",
    amount: "المبلغ",
    note: "ملاحظة",
    amountPlaceholder: "100",
    notePlaceholder: "إجراء يدوي من الأدمن",
    cancel: "إلغاء",
    submit: "إضافة الرصيد",
    submitting: "جارٍ الحفظ...",
    required: "يجب أن يكون المبلغ أكبر من 0.",
    success: "تمت إضافة الرصيد بنجاح.",
    error: "تعذر تعديل رصيد المحفظة.",
  },
};

export default function WalletAdjustDialog({ open, onOpenChange, userId }) {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const text = copy[locale] || copy.en;

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("manual admin action");
  const [amountError, setAmountError] = useState("");
  const [noteError, setNoteError] = useState("");

  const walletAdjustSchema = z.object({
    amount: z.number().positive(text.required),
    note: z
      .string()
      .trim()
      .min(3, locale === "ar" ? "الملاحظة قصيرة جدًا." : "Note is too short."),
  });

  const { mutate, isPending } = useAdjustUserWalletMutation({
    onSuccess: () => {
      toast.success(text.success);
      onOpenChange(false);
      setAmount("");
      setNote("manual admin action");
      setAmountError("");
      setNoteError("");
    },
    onError: () => {
      toast.error(text.error);
    },
  });

  const numericAmount = useMemo(() => Number(amount), [amount]);
  const canSubmit =
    Boolean(userId) &&
    !isPending &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0;

  const handleSubmit = () => {
    if (!userId || isPending) return;
    const validation = walletAdjustSchema.safeParse({
      amount: numericAmount,
      note: note?.trim() || "",
    });

    if (!validation.success) {
      const amountIssue = validation.error.issues.find(
        (issue) => issue.path[0] === "amount",
      );
      const noteIssue = validation.error.issues.find(
        (issue) => issue.path[0] === "note",
      );
      setAmountError(amountIssue?.message || "");
      setNoteError(noteIssue?.message || "");
      return;
    }

    setAmountError("");
    setNoteError("");
    mutate({
      userId,
      payload: {
        action: "add",
        amount: validation.data.amount,
        note: validation.data.note,
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setAmountError("");
          setNoteError("");
        }
      }}
    >
      <DialogContent
        className={`border-white/10 bg-[#202021] text-white sm:max-w-md ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription className="text-white/55">
            {text.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="text-sm text-white/80">{text.amount}</div>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                if (amountError) setAmountError("");
              }}
              placeholder={text.amountPlaceholder}
            />
            {amountError ? (
              <p className="text-xs text-[#ef4444]">{amountError}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="text-sm text-white/80">{text.note}</div>
            <Input
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                if (noteError) setNoteError("");
              }}
              placeholder={text.notePlaceholder}
            />
            {noteError ? (
              <p className="text-xs text-[#ef4444]">{noteError}</p>
            ) : null}
          </div>
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
            {text.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {text.submitting}
              </>
            ) : (
              text.submit
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
