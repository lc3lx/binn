"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import KycVerificationContent from "@/components/auth/KycVerificationContent";
import { useTranslations } from "@/hooks/useTranslations";

export default function KycVerificationDialog({ open, onOpenChange }) {
  const { t } = useTranslations();

  const handleSubmitted = () => {
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[120] max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-[#2d2d2f] p-4 sm:p-6">
        <DialogTitle className="sr-only">{t("kycDialog.title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("kycDialog.subtitle")}
        </DialogDescription>
        <KycVerificationContent compact onSubmitted={handleSubmitted} />
      </DialogContent>
    </Dialog>
  );
}
