"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/hooks/useTranslations";
import { useReviewUserKycMutation } from "@/api/services/admin/kyc/kyc.query";

const copy = {
  en: {
    title: "Review KYC Status",
    description:
      "Approve or reject the user's KYC request. Rejection requires a reason.",
    statusLabel: "Decision",
    approve: "Approve",
    reject: "Reject",
    reasonLabel: "Rejection Reason",
    reasonPlaceholder: "Write why this KYC request is rejected...",
    reasonRequired: "Rejection reason is required.",
    cancel: "Cancel",
    submit: "Save",
    submitting: "Saving...",
    successApproved: "KYC approved successfully.",
    successRejected: "KYC rejected successfully.",
    error: "Failed to update KYC status.",
  },
  ar: {
    title: "مراجعة حالة التوثيق",
    description: "قم بقبول أو رفض طلب التوثيق. في حال الرفض يجب كتابة السبب.",
    statusLabel: "القرار",
    approve: "قبول",
    reject: "رفض",
    reasonLabel: "سبب الرفض",
    reasonPlaceholder: "اكتب سبب رفض طلب التوثيق...",
    reasonRequired: "سبب الرفض مطلوب.",
    cancel: "إلغاء",
    submit: "حفظ",
    submitting: "جارٍ الحفظ...",
    successApproved: "تم قبول التوثيق بنجاح.",
    successRejected: "تم رفض التوثيق بنجاح.",
    error: "تعذر تحديث حالة التوثيق.",
  },
};

function normalizeInitialStatus(value) {
  const status = String(value || "").toLowerCase();
  if (status === "approved" || status === "verified") return "approved";
  if (status === "rejected" || status === "blocked") return "rejected";
  return "approved";
}

export default function EditUserStatue({
  userId,
  open,
  onOpenChange,
  currentKycStatus,
  initialDecision,
}) {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const text = copy[locale] || copy.en;

  const [status, setStatus] = useState(
    () => initialDecision || normalizeInitialStatus(currentKycStatus),
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const { mutate, isPending } = useReviewUserKycMutation({
    onSuccess: () => {
      toast.success(
        status === "approved" ? text.successApproved : text.successRejected,
      );
      onOpenChange(false);
    },
    onError: () => {
      toast.error(text.error);
    },
  });

  const canSubmit = useMemo(() => {
    if (!userId || isPending) return false;
    if (status === "rejected") return rejectionReason.trim().length > 0;
    return true;
  }, [isPending, rejectionReason, status, userId]);

  const handleSubmit = () => {
    if (!userId || isPending) return;

    if (status === "rejected" && !rejectionReason.trim()) {
      setReasonError(text.reasonRequired);
      return;
    }

    setReasonError("");
    mutate({
      userId,
      payload: {
        status,
        rejectionReason: status === "rejected" ? rejectionReason.trim() : "",
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`border-white/10 bg-[#202021] text-white sm:max-w-xl ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription className="text-white/50">
            {text.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-white/85">
              {text.statusLabel}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={() => setStatus("approved")}
                className={`h-10 ${
                  status === "approved"
                    ? "bg-primary text-black hover:bg-primary/90"
                    : "border border-white/15 bg-[#2a2a2c] text-white/75 hover:bg-[#303033]"
                }`}
              >
                {text.approve}
              </Button>
              <Button
                type="button"
                onClick={() => setStatus("rejected")}
                className={`h-10 ${
                  status === "rejected"
                    ? "border border-[#ef4444]/35 bg-[#3a1618] text-[#ef4444] hover:bg-[#431a1d]"
                    : "border border-white/15 bg-[#2a2a2c] text-white/75 hover:bg-[#303033]"
                }`}
              >
                {text.reject}
              </Button>
            </div>
          </div>

          {status === "rejected" ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-white/85">
                {text.reasonLabel}
              </div>
              <textarea
                value={rejectionReason}
                onChange={(event) => {
                  setRejectionReason(event.target.value);
                  if (reasonError) setReasonError("");
                }}
                rows={4}
                placeholder={text.reasonPlaceholder}
                className="w-full resize-none rounded-md border border-white/15 bg-[#2a2a2c] p-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-primary/40"
              />
              {reasonError ? (
                <p className="text-xs text-[#ef4444]">{reasonError}</p>
              ) : null}
            </div>
          ) : null}

        </div>

        <DialogFooter
          className={`gap-2 ${isArabic ? "sm:flex-row-reverse" : "sm:flex-row"}`}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-white/15 bg-[#2a2a2c] text-white/80 hover:bg-[#303033] hover:text-white"
          >
            {text.cancel}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-w-[130px]"
          >
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
