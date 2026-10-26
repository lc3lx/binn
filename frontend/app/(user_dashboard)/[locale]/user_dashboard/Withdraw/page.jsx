"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRequestWithdrawMutation } from "@/api/services/user/Withdraw/withdraw.query";
import { useDashboardSummaryQuery } from "@/api/services/user/Statistics/statistics.query";

export default function WithdrawPage() {
  const { t, locale } = useTranslations();
  const withdrawMutation = useRequestWithdrawMutation();
  const { data: summaryResponse } = useDashboardSummaryQuery();
  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const summary = summaryResponse?.data || {};
  const balance = Number(summary?.walletBalance || 0);
  const minWithdrawal = 2.5;

  // Weekend Rule: Saturday (6) and Sunday (0) are official holidays for withdrawals
  const today = new Date();
  const dayOfWeek = today.getUTCDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const networks = [
    {
      key: "bsc",
      label: t("withdraw.networks.bsc") || "BNB Smart Chain (BEP20)",
      fee: 0.5,
      placeholder: t("withdraw.address.placeholder.bsc") || "0x...",
    },
  ];

  const [net, setNet] = useState("bsc");
  const currentNet = networks.find((n) => n.key === net) || networks[0];
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("cash out");

  const parsedAmount = useMemo(() => {
    const a = parseFloat(amount);
    return Number.isFinite(a) ? Math.max(0, a) : 0;
  }, [amount]);

  const receive = Math.max(0, parsedAmount - currentNet.fee);
  const insufficient = parsedAmount < minWithdrawal;
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address.trim());
  const invalid =
    !address ||
    !isValidAddress ||
    parsedAmount <= 0 ||
    parsedAmount > balance ||
    insufficient;

  const handleWithdraw = async () => {
    if (invalid) return;
    try {
      await withdrawMutation.mutateAsync({
        amount: parsedAmount,
        walletAddress: address.trim(),
        withdrawalFee: Number(currentNet.fee),
        note: note.trim() || "cash out",
      });
      toast.success(
        locale === "ar"
          ? "تم إرسال طلب السحب بنجاح"
          : "Withdraw request submitted successfully",
      );
      setAmount("");
      setAddress("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (locale === "ar" ? "فشل إرسال طلب السحب" : "Failed to submit withdraw request"),
      );
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {t("withdraw.title")}
          </h1>
          <p className="text-white/70 text-xs sm:text-sm mt-1">
            {t("withdraw.subtitle")}
          </p>
        </div>

        {isWeekend && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold">
                {locale === "ar"
                  ? "عطلة نهاية الأسبوع (السبت والأحد) - قسم السحوبات مغلق"
                  : "Weekend Holiday (Saturday & Sunday) - Withdrawals Closed"}
              </p>
              <p className="mt-1 text-amber-200/80 leading-relaxed">
                {locale === "ar"
                  ? "نلفت انتباهكم إلى أن يومي السبت والأحد هما عطلة رسمية لنظام السحب ومعالجة الحوالات. يستأنف استقبال ومعالجة طلبات السحب وسحب الأرباح يومياً من الإثنين إلى الجمعة."
                  : "Please note that Saturday and Sunday are official platform holidays for withdrawals processing. Submissions reopen Monday through Friday."}
              </p>
            </div>
          </div>
        )}

        <Card className="bg-card border border-gray-600/40">
          <CardContent className="p-4 sm:p-6">
            <div className="bg-[#3F3F3F] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-500/40 bg-black/20 text-white transition-transform duration-200 ease-out hover:scale-105">
                  <Wallet className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-white/70 text-xs">
                    {t("withdraw.balance.label")}
                  </div>
                  <div className="text-white text-lg sm:text-xl font-semibold">
                    {nf.format(balance)}{" "}
                    <span className="text-primary">USDT</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-white/80 mb-2">{t("withdraw.network")}</div>
              <div className="flex flex-wrap gap-2">
                {networks.map((n) => (
                  <Button
                    key={n.key}
                    variant={n.key === net ? "default" : "outline"}
                    size="sm"
                    className={n.key === net ? "" : "border-gray-600/40"}
                    onClick={() => setNet(n.key)}
                  >
                    {n.label}
                  </Button>
                ))}
              </div>
              <div className="mt-2 text-xs text-white/70 flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>
                  {t("withdraw.fee")} {nf.format(currentNet.fee)} USDT
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-white/80 mb-2">
                {t("withdraw.address.label")}
              </div>
              <div className="relative">
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={currentNet.placeholder}
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white/80">
                  {t("withdraw.amount.label")}
                </div>
                <Button
                  variant="link"
                  className="text-primary"
                  onClick={() => setAmount(String(balance))}
                >
                  {t("withdraw.amount.max")}
                </Button>
              </div>
              <div className="relative">
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 text-xs">
                  USDT
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/70">
                <span>
                  {t("withdraw.minimum")} {minWithdrawal} USDT
                </span>
                <span>
                  {t("withdraw.networkFee")} {nf.format(currentNet.fee)} USDT
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between bg-black/10 rounded-lg px-4 py-3">
                <span className="text-white/70">{t("withdraw.receive")}</span>
                <span className="text-white text-lg font-semibold">
                  {nf.format(receive)}{" "}
                  <span className="text-primary">USDT</span>
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-white/80 mb-2">
                {locale === "ar" ? "ملاحظة" : "Note"}
              </div>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={locale === "ar" ? "اكتب ملاحظة السحب" : "cash out"}
              />
            </div>

            <div className="mt-6">
              <Button
                className="w-full py-6 rounded-2xl font-bold text-sm"
                disabled={invalid || isWeekend || withdrawMutation.isPending}
                onClick={handleWithdraw}
              >
                {isWeekend
                  ? locale === "ar"
                    ? "السحب مغلق في عطلة نهاية الأسبوع (السبت والأحد)"
                    : "Withdrawals Closed on Weekends (Sat & Sun)"
                  : withdrawMutation.isPending
                    ? locale === "ar"
                      ? "جاري الإرسال..."
                      : "Submitting..."
                    : t("withdraw.submit")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
