"use client";

import { toast } from "sonner";
import { Clock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function useComingSoonToast() {
  const { t } = useTranslations();
  const show = (message = t("signup.comingSoon")) => {
    toast.custom(
      () => (
        <div className="flex items-center gap-3 bg-[#0b0e11] border border-gray-800 text-white rounded-xl px-4 py-3 shadow-lg">
          <div className="p-2 rounded-full bg-primary text-black">
            <Clock className="w-4 h-4" />
          </div>
          <div className="font-semibold">{message}</div>
        </div>
      ),
      { duration: 3000 },
    );
  };
  return show;
}
