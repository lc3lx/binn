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
    blockTitle: "Block User",
    blockDescription:
      "Are you sure you want to block this user? They will lose access until unblocked.",
    unblockTitle: "Unblock User",
    unblockDescription:
      "Are you sure you want to unblock this user and restore access?",
    cancel: "Cancel",
    blockConfirm: "Confirm Block",
    unblockConfirm: "Confirm Unblock",
    loading: "Please wait...",
  },
  ar: {
    blockTitle: "حظر المستخدم",
    blockDescription:
      "هل أنت متأكد من حظر هذا المستخدم؟ سيتم منعه من الوصول حتى إزالة الحظر.",
    unblockTitle: "إزالة حظر المستخدم",
    unblockDescription:
      "هل أنت متأكد من إزالة الحظر عن هذا المستخدم وإعادة صلاحية الوصول؟",
    cancel: "إلغاء",
    blockConfirm: "تأكيد الحظر",
    unblockConfirm: "تأكيد إزالة الحظر",
    loading: "يرجى الانتظار...",
  },
};

export default function ConfirmUserBlockDialog({
  open,
  onOpenChange,
  onConfirm,
  isBlocked,
  isLoading,
  isArabic,
}) {
  const text = isArabic ? copy.ar : copy.en;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={` text-white sm:max-w-md ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle className="pt-5">
            {isBlocked ? text.unblockTitle : text.blockTitle}
          </DialogTitle>
          <DialogDescription className="text-white/55">
            {isBlocked ? text.unblockDescription : text.blockDescription}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter
          className={`gap-2 ${isArabic ? "sm:flex-row-reverse" : "sm:flex-row "}`}
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
            className={`min-w-[150px] ${
              isBlocked
                ? "bg-primary text-black hover:bg-primary/90"
                : "bg-destructive  hover:bg-destructive/90 text-white"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {text.loading}
              </>
            ) : isBlocked ? (
              text.unblockConfirm
            ) : (
              text.blockConfirm
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
