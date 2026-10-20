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
    title: "Notify User",
    description: "Send a custom message to the user about this withdrawal.",
    label: "Message",
    placeholder: "Type your message...",
    cancel: "Cancel",
    send: "Send",
    loading: "Sending...",
  },
  ar: {
    title: "إشعار المستخدم",
    description: "أرسل رسالة مخصصة للمستخدم بخصوص عملية السحب هذه.",
    label: "الرسالة",
    placeholder: "اكتب رسالتك...",
    cancel: "إلغاء",
    send: "إرسال",
    loading: "جاري الإرسال...",
  },
};

export default function WithdrawNotifyDialog({
  open,
  onOpenChange,
  message,
  onMessageChange,
  onSubmit,
  isLoading,
  isArabic,
  error,
}) {
  const text = isArabic ? copy.ar : copy.en;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`text-white sm:max-w-md ${isArabic ? "text-right" : "text-left"}`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription className="text-white/60">
            {text.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-white/70">
            {text.label}
          </label>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={text.placeholder}
            rows={4}
            className={`w-full resize-none rounded-md border bg-black/30 px-3 py-2 text-sm text-white outline-none transition-colors ${
              error ? "border-destructive/70" : "border-white/15 focus:border-primary/60"
            }`}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

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
            onClick={onSubmit}
            disabled={isLoading}
            className="min-w-[120px] bg-primary text-black hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {text.loading}
              </>
            ) : (
              text.send
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
