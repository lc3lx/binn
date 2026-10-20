"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const copy = {
  en: {
    confirmTitle: "Confirm Deposit",
    confirmDescription:
      "Are you sure you want to confirm this deposit request?",
    rejectTitle: "Reject Deposit",
    rejectDescription: "Are you sure you want to reject this deposit request?",
    cancel: "Cancel",
    confirm: "Confirm",
    reject: "Reject",
    loading: "Please wait...",
    rejectionReasonLabel: "Rejection reason",
    rejectionReasonPlaceholder: "Enter the reason for rejection",
  },
  ar: {
    confirmTitle: "تأكيد الإيداع",
    confirmDescription: "هل أنت متأكد من قبول طلب الإيداع هذا؟",
    rejectTitle: "رفض الإيداع",
    rejectDescription: "هل أنت متأكد من رفض طلب الإيداع هذا؟",
    cancel: "إلغاء",
    confirm: "تأكيد",
    reject: "رفض",
    loading: "يرجى الانتظار...",
    rejectionReasonLabel: "سبب الرفض",
    rejectionReasonPlaceholder: "اكتب سبب رفض الطلب",
  },
};

export default function DepositReviewDialog({
  open,
  onOpenChange,
  mode,
  onConfirm,
  isLoading,
  isArabic,
  rejectionReason,
  onRejectionReasonChange,
  rejectionReasonError,
}) {
  const text = isArabic ? copy.ar : copy.en;
  const isReject = mode === "rejected";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`text-white sm:max-w-md ${isArabic ? "text-right" : "text-left"}`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle>
            {isReject ? text.rejectTitle : text.confirmTitle}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {isReject ? text.rejectDescription : text.confirmDescription}
          </DialogDescription>
        </DialogHeader>

        {isReject ? (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-white/70">
              {text.rejectionReasonLabel}
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => onRejectionReasonChange(e.target.value)}
              placeholder={text.rejectionReasonPlaceholder}
              rows={3}
              className={`w-full resize-none rounded-md border bg-black/30 px-3 py-2 text-sm text-white outline-none transition-colors ${
                rejectionReasonError
                  ? "border-destructive/70"
                  : "border-white/15 focus:border-primary/60"
              }`}
            />
            {rejectionReasonError ? (
              <p className="text-xs text-destructive">{rejectionReasonError}</p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter
          className={`gap-2 ${isArabic ? "sm:flex-row-reverse" : "sm:flex-row"}`}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {text.cancel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={
              isReject
                ? "min-w-[120px] bg-destructive text-white hover:bg-destructive/90"
                : "min-w-[120px] bg-primary text-black hover:bg-primary/90"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {text.loading}
              </>
            ) : isReject ? (
              text.reject
            ) : (
              text.confirm
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
