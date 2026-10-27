"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  CheckCircle,
  Copy,
  Info,
  Loader2,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SupportButton from "@/components/site/SupportButton";
import {
  useCreatePaymentOrderMutation,
  usePaymentOrderStatusQuery,
  useVerifyPaymentTxMutation,
} from "@/api/services/user/deposit/deposit.query";
import { formatApiError } from "@/lib/format-error";

const DEFAULT_PLATFORM_BEP20_ADDRESS = "0x24EF9b2804C8a9550A28Ca35806d9D6B91ea6B19";

const TIER_PRESETS = [
  { tier: "E1", amount: 50, daily: "2.50$" },
  { tier: "E2", amount: 100, daily: "5.00$" },
  { tier: "E3", amount: 200, daily: "10.00$" },
  { tier: "E4", amount: 500, daily: "25.00$" },
  { tier: "E5", amount: 1000, daily: "50.00$" },
  { tier: "E6", amount: 2000, daily: "100.00$" },
  { tier: "E7", amount: 5000, daily: "250.00$" },
];

function pickPayload(payload) {
  return payload?.data || payload || {};
}

function formatAmount(value, locale) {
  const number = Number(value || 0);
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(number);
}

export default function DepositPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const isArabic = locale === "ar";

  const [baseAmount, setBaseAmount] = useState("50");
  const [order, setOrder] = useState(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [manualTxHash, setManualTxHash] = useState("");

  const successNotifiedRef = useRef(false);
  const detectedNotifiedRef = useRef(false);

  const createOrderMutation = useCreatePaymentOrderMutation();
  const verifyTxMutation = useVerifyPaymentTxMutation();

  const orderId = order?.order_id || "";
  const { data: orderStatusResponse, refetch: refetchOrderStatus } =
    usePaymentOrderStatusQuery(orderId, {
      enabled: Boolean(orderId),
      refetchInterval: orderId ? 10000 : false,
    });

  const orderStatusPayload = useMemo(
    () => pickPayload(orderStatusResponse),
    [orderStatusResponse]
  );

  const orderData = useMemo(() => {
    if (!order) return null;

    return {
      ...order,
      ...(orderStatusPayload || {}),
      order_id: order.order_id,
      address: order.address || orderStatusPayload?.address,
      base_amount: order.base_amount ?? orderStatusPayload?.base_amount,
      micro_amount: order.micro_amount ?? orderStatusPayload?.micro_amount,
      expected_amount:
        order.expected_amount ?? orderStatusPayload?.expected_amount,
      created_at: order.created_at || orderStatusPayload?.created_at,
      expires_at: orderStatusPayload?.expires_at || order.expires_at,
    };
  }, [order, orderStatusPayload]);

  // Active deposit address: Order address or default platform BEP-20 address
  const activeAddress =
    orderData?.address || DEFAULT_PLATFORM_BEP20_ADDRESS;

  const qrValue = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    activeAddress
  )}`;

  useEffect(() => {
    if (!orderData?.expires_at) return undefined;

    const interval = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [orderData?.expires_at]);

  useEffect(() => {
    const status = String(orderData?.status || "").toLowerCase();
    const creditedAt = orderData?.credited_at;

    if (status === "paid" && !creditedAt && !detectedNotifiedRef.current) {
      detectedNotifiedRef.current = true;
      toast.info(
        isArabic
          ? "تم كشف التحويل عبر البلوكتشين، جاري إضافة الرصيد..."
          : "Payment detected on BSC, crediting your wallet..."
      );
    }

    if (status === "paid" && creditedAt && !successNotifiedRef.current) {
      successNotifiedRef.current = true;
      toast.success(
        isArabic
          ? "تمت إضافة الرصيد إلى محفظتك بنجاح!"
          : "Deposit credited to your wallet successfully!"
      );
    }
  }, [isArabic, orderData?.credited_at, orderData?.status]);

  const expiresAtTs = orderData?.expires_at
    ? new Date(orderData.expires_at).getTime()
    : 0;
  const remainingSeconds = expiresAtTs
    ? Math.max(0, Math.floor((expiresAtTs - nowTs) / 1000))
    : 0;

  const remainingLabel = `${String(Math.floor(remainingSeconds / 60)).padStart(
    2,
    "0"
  )}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  const status = String(orderData?.status || "").toLowerCase();
  const creditedAt = orderData?.credited_at;
  const mismatchType = String(orderData?.mismatch_type || "none").toLowerCase();

  const isMismatch = ["underpaid", "overpaid", "duplicate_payment"].includes(
    mismatchType
  );
  const isExpired = status === "expired";
  const isPending = status === "pending";
  const isFinalSuccess = status === "paid" && Boolean(creditedAt);

  const handleCreateOrder = async (customAmt) => {
    const amountValue = Number(customAmt || baseAmount);
    if (!amountValue || amountValue <= 0) {
      toast.error(isArabic ? "أدخل مبلغاً صحيحاً" : "Enter a valid amount");
      return;
    }

    try {
      const response = await createOrderMutation.mutateAsync({
        baseAmount: amountValue,
      });
      const payload = pickPayload(response);

      setOrder(payload);
      setManualTxHash("");
      setNowTs(Date.now());
      detectedNotifiedRef.current = false;
      successNotifiedRef.current = false;

      toast.success(
        isArabic
          ? "تم إنشاء طلب الدفع الآلي بنجاح!"
          : "Automated payment order created!"
      );
    } catch (error) {
      toast.error(formatApiError(error, locale));
    }
  };

  const handleCopyAddress = async () => {
    if (!activeAddress) return;
    try {
      await navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(
        isArabic ? "تم نسخ عنوان المحفظة بنجاح!" : "Address copied to clipboard!"
      );
    } catch {
      toast.error(isArabic ? "تعذر النسخ" : "Copy failed");
    }
  };

  const handleVerifyTx = async () => {
    if (!manualTxHash.trim()) {
      toast.error(
        isArabic
          ? "يرجى إدخال هاش المعاملة (TX Hash) أولاً"
          : "Please enter the TX Hash first"
      );
      return;
    }

    try {
      const res = await verifyTxMutation.mutateAsync({
        orderId: orderId || undefined,
        txHash: manualTxHash.trim(),
        walletAddress: activeAddress,
        amount: Number(baseAmount) || 50,
      });
      const payload = pickPayload(res);
      toast.success(
        isArabic
          ? "تم التحقق من المعاملة بنجاح وقيد الرصيد!"
          : "Transaction verified and credited successfully!"
      );
      if (orderId) {
        refetchOrderStatus();
      }
      if (payload) {
        setOrder((prev) => ({ ...prev, ...payload }));
      }
    } catch (err) {
      toast.error(formatApiError(err, locale));
    }
  };

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen p-3 sm:p-6 pb-28 text-white max-w-6xl mx-auto space-y-6"
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-[#071326] via-[#0b1c38] to-[#071326] p-5 sm:p-6 rounded-3xl border border-cyan-500/25 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-black font-black">
              <Wallet className="h-4 w-4 stroke-[2.5]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {isArabic ? "شحن رصيد المحفظة" : "Deposit USDT"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-cyan-200/70">
            {isArabic
              ? "إيداع فوري وتلقائي عبر البلوكتشين (BEP-20) بدون أي شروط هوية أو تأخير"
              : "Instant automated deposit via BEP-20 without KYC or delays"}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 shadow-md">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            {isArabic ? "الشبكة: BEP-20 (BNB Smart Chain)" : "Network: BEP-20 (BNB Smart Chain)"}
          </span>
        </div>
      </div>

      {/* 2. Main 2-Column Deposit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Amounts & Control (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preset Scooter Tiers Card */}
          <div className="bg-[#081223] rounded-3xl border border-cyan-500/20 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                {isArabic ? "اختر باقة الاستثمار المطلوبة:" : "Select Investment Tier:"}
              </h2>
              <span className="text-[11px] font-bold text-cyan-400">
                {isArabic ? "عائد 5% يومياً" : "5% Daily Return"}
              </span>
            </div>

            {/* Quick Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIER_PRESETS.map((tItem) => {
                const isSelected = String(baseAmount) === String(tItem.amount);
                return (
                  <button
                    key={tItem.tier}
                    type="button"
                    onClick={() => {
                      setBaseAmount(String(tItem.amount));
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-gradient-to-tr from-cyan-600 to-sky-500 border-cyan-300 text-black shadow-lg shadow-cyan-500/30 font-black"
                        : "bg-[#0c1a32] border-cyan-500/20 hover:border-cyan-500/50 text-white"
                    }`}
                  >
                    <span className="text-xs font-bold">{tItem.tier}</span>
                    <span className="text-sm font-extrabold font-mono mt-0.5">
                      ${tItem.amount}
                    </span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? "text-slate-900 font-bold" : "text-emerald-400"
                      }`}
                    >
                      {tItem.daily} {isArabic ? "يومياً" : "/day"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isArabic ? "المبلغ المراد شحنه (USDT):" : "Amount to Deposit (USDT):"}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(e.target.value)}
                  placeholder="50"
                  className="h-12 rounded-2xl bg-[#0b172c] border border-cyan-500/30 text-white text-base font-bold pr-16 focus-visible:ring-cyan-400"
                />
                <span className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 text-xs font-black text-cyan-400">
                  USDT
                </span>
              </div>
            </div>

            {/* Create Automated Order Button */}
            <Button
              type="button"
              onClick={() => handleCreateOrder()}
              disabled={createOrderMutation.isPending}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all"
            >
              {createOrderMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? "جاري إنشاء الطلب الآلي..." : "Generating order..."}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-4 w-4 stroke-[2.5]" />
                  {isArabic ? "توليد طلب إيداع آلي (فحص تلقائي)" : "Generate Instant Auto Order"}
                </span>
              )}
            </Button>
          </div>

          {/* Quick Notice Card */}
          <div className="rounded-3xl border border-cyan-500/20 bg-[#081223] p-4 text-xs space-y-2 text-slate-300">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>{isArabic ? "تعليمات وضمانات الإيداع:" : "Deposit Instructions & Guarantee:"}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-slate-300/90">
              <li>{isArabic ? "الشبكة المعتمدة فقط: BEP-20 (BNB Smart Chain)." : "Network supported: BEP-20 (BSC) only."}</li>
              <li>{isArabic ? "الحد الأدنى للشحن: 50$ (لتفعيل سكوتر E1 وبدء جني 2.50$ يومياً)." : "Minimum deposit: $50 (activates E1 tier for $2.50/day)."}</li>
              <li>{isArabic ? "جميع المعاملات تتم تلقائياً بالكامل وتسجل علنياً على البلوكتشين." : "All transactions are fully automated on BNB Smart Chain."}</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Deposit Address, QR Code & TX Verification (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#081223] rounded-3xl border border-cyan-500/25 p-5 sm:p-6 shadow-xl space-y-5">
            {/* Order Status Banner if order exists */}
            {orderData && (
              <div className="p-3.5 rounded-2xl border border-cyan-500/30 bg-[#0d1d36] flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    {isArabic ? "رقم الطلب الآلي:" : "Automated Order ID:"}
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">{orderData.order_id}</span>
                </div>

                {isPending && (
                  <div className="text-end">
                    <span className="text-slate-400 block text-[10px]">
                      {isArabic ? "الوقت المتبقي:" : "Time Left:"}
                    </span>
                    <span className="font-mono text-emerald-400 font-extrabold text-sm animate-pulse">
                      {remainingLabel}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* QR Code and Wallet Display */}
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#0a1528] border border-cyan-500/20 p-5 rounded-2xl">
              {/* QR Image */}
              <div className="p-2.5 rounded-2xl bg-white shadow-xl shadow-cyan-950/50 shrink-0">
                <img
                  src={qrValue}
                  alt="Deposit QR"
                  width={150}
                  height={150}
                  className="w-36 h-36 rounded-xl"
                />
              </div>

              {/* Address details */}
              <div className="flex-1 w-full space-y-2 text-center sm:text-start">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  {isArabic ? "عنوان محفظة الإيداع (BEP-20 USDT)" : "Deposit Wallet Address (BEP-20 USDT)"}
                </span>

                <div className="p-2.5 rounded-xl bg-[#060e1b] border border-cyan-500/30 font-mono text-xs sm:text-sm text-white break-all select-all font-bold">
                  {activeAddress}
                </div>

                <div className="pt-1">
                  <Button
                    type="button"
                    onClick={handleCopyAddress}
                    className="w-full sm:w-auto h-10 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-cyan-400" />
                    )}
                    <span>{copied ? (isArabic ? "تم النسخ بنجاح!" : "Copied!") : (isArabic ? "نسخ عنوان المحفظة" : "Copy Address")}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Expected Amount details (if auto order generated) */}
            {orderData && (
              <div className="p-4 rounded-2xl bg-[#0a1528] border border-cyan-500/25 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{isArabic ? "المبلغ الأساسي المطلوب:" : "Base Amount:"}</span>
                  <span className="font-bold text-white">${formatAmount(orderData.base_amount, locale)} USDT</span>
                </div>

                {orderData.micro_amount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{isArabic ? "كسور التمييز الآلي:" : "Micro Identifier:"}</span>
                    <span className="font-mono text-cyan-400">+{formatAmount(orderData.micro_amount, locale)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-cyan-500/20 pt-2 text-sm">
                  <span className="font-extrabold text-white">{isArabic ? "المبلغ المتوقع للتحويل التلقائي:" : "Exact Expected Amount:"}</span>
                  <span className="font-black text-cyan-300 font-mono text-base">
                    {formatAmount(orderData.expected_amount || orderData.base_amount, locale)} USDT
                  </span>
                </div>
              </div>
            )}

            {/* Manual TX Hash Instant Verification Box */}
            <div className="p-4 rounded-2xl bg-[#09152a] border border-cyan-500/30 space-y-3">
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">
                  {isArabic
                    ? "هل أتممت التحويل بالفعل؟ أدخل هاش المعاملة (TX Hash) للتحقق الفوري:"
                    : "Sent already? Enter TX Hash for instant blockchain verification:"}
                </label>
                <p className="text-[11px] text-slate-400">
                  {isArabic
                    ? "انسخ هاش المعاملة من محفظتك (Binance / TrustWallet / MetaMask) والصقه هنا ليتم قيد الرصيد فوراً."
                    : "Paste transaction hash from your wallet for immediate credit confirmation."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={manualTxHash}
                  onChange={(e) => setManualTxHash(e.target.value)}
                  placeholder="0x..."
                  className="h-11 rounded-xl bg-[#060e1c] border border-cyan-500/30 font-mono text-xs text-white placeholder:text-slate-500 focus-visible:ring-cyan-400 flex-1"
                />

                <Button
                  type="button"
                  onClick={handleVerifyTx}
                  disabled={verifyTxMutation.isPending || !manualTxHash.trim()}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-md shrink-0 flex items-center justify-center gap-1.5"
                >
                  {verifyTxMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 stroke-[2.5]" />
                  )}
                  <span>
                    {verifyTxMutation.isPending
                      ? (isArabic ? "جاري الفحص..." : "Verifying...")
                      : (isArabic ? "تحقق وإضافة الرصيد" : "Verify & Credit")}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SupportButton className="fixed bottom-6 z-50 ltr:right-6 rtl:left-6" />
    </div>
  );
}
