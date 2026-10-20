"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, KeyRound, Info } from "lucide-react";

export default function SecurityPage() {
  const { t, locale } = useTranslations();
  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const canUpdate = currentPassword.length >= 6 && newPassword.length >= 6;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {t("security.title")}
          </h1>
          <p className="text-white/70 text-xs sm:text-sm mt-1">
            {t("security.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border border-gray-600/40">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-500/40 bg-black/20 text-white transition-transform duration-200 ease-out hover:scale-105">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="text-white font-semibold">
                      {t("security.twofa.title")}
                    </div>
                    <div className="text-white/70 text-xs sm:text-sm">
                      {t("security.twofa.desc")}
                    </div>
                  </div>
                </div>
                <Button size="sm">{t("security.twofa.enable")}</Button>
              </div>

              <div className="mt-6">
                <div className="text-white/90 text-sm">
                  {t("security.twofa.provider")}
                </div>
                <div className="text-white/60 text-xs">
                  {t("security.twofa.providerNote")}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 bg-[#2b2b2b] rounded-lg px-3 py-2">
                <Info className="w-4 h-4 text-yellow-300" />
                <span className="text-white/80 text-xs sm:text-sm">
                  {t("security.twofa.recommendation")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-gray-600/40">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-500/40 bg-black/20 text-white transition-transform duration-200 ease-out hover:scale-105">
                  <KeyRound className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-white font-semibold">
                    {t("security.password.title")}
                  </div>
                  <div className="text-white/70 text-xs sm:text-sm">
                    {t("security.password.desc")}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-[#0b0e11] text-white border border-gray-600/40"
                  placeholder={t("security.password.current")}
                />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#0b0e11] text-white border border-gray-600/40"
                  placeholder={t("security.password.new")}
                />
              </div>

              <div className="mt-6">
                <Button className="w-full" disabled={!canUpdate}>
                  {t("security.password.update")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
