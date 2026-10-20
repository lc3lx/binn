"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { CheckCircle, Copy, Info, Loader2, RefreshCw, Zap } from "lucide-react";
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

  const [baseAmount, setBaseAmount] = useState("100");
  const [order, setOrder] = useState(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [manualTxHash, setManualTxHash] = useState("");

  const successNotifiedRef = useRef(false);
  const detectedNotifiedRef = useRef(false);

  const createOrderMutation = useCreatePaymentOrderMutation();
  const verifyTxMutation = useVerifyPaymentTxMutation();

  const orderId = order?.order_id || "";
  const { data: orderStatusResponse, refetch: refetchOrderStatus } = usePaymentOrderStatusQuery(orderId, {
    enabled: Boolean(orderId),
    refetchInterval: orderId ? 10000 : false,
  });

  const orderStatusPayload = useMemo(
    () => pickPayload(orderStatusResponse),
    [orderStatusResponse],
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

  const qrValue = orderData?.address
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(orderData.address)}`
    : "";

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
          : "Payment detected on BSC, crediting your wallet...",
      );
    }

    if (status === "paid" && creditedAt && !successNotifiedRef.current) {
      successNotifiedRef.current = true;
      toast.success(
        isArabic
          ? "تمت إضافة الرصيد إلى محفظتك بنجاح!"
          : "Deposit credited to your wallet successfully!",
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
    "0",
  )}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  const status = String(orderData?.status || "").toLowerCase();
  const creditedAt = orderData?.credited_at;
  const mismatchType = String(orderData?.mismatch_type || "none").toLowerCase();

  const isMismatch = ["underpaid", "overpaid", "duplicate_payment"].includes(
    mismatchType,
  );
  const isExpired = status === "expired";
  const isPending = status === "pending";
  const isPaidAwaitingCredit = status === "paid" && !creditedAt;
  const isFinalSuccess = status === "paid" && Boolean(creditedAt);

  const stateMessage = isFinalSuccess
    ? isArabic
      ? "تمت إضافة الرصيد تلقائياً بنجاح!"
      : "Wallet credited automatically!"
    : isPaidAwaitingCredit
      ? isArabic
        ? "تم كشف التحويل على شبكة BSC، جاري قيد الرصيد..."
        : "Payment detected on BSC, crediting wallet..."
      : isExpired
        ? isArabic
          ? "انتهت صلاحية الطلب، يرجى إنشاء طلب جديد."
          : "Order expired, please create a new one."
        : isMismatch
          ? isArabic
            ? "يوجد اختلاف في المبلغ المحول، يرجى التواصل مع الدعم."
            : "Payment amount mismatch detected, please contact support."
          : isArabic
            ? "بانتظار التحويل على شبكة BEP-20 (تأكيد تلقائي بالكامل)"
            : "Waiting for payment on BEP-20 (Fully automated confirmation)";

  const handleCreateOrder = async () => {
    const amountValue = Number(baseAmount);
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
        isArabic ? "تم إنشاء طلب الدفع بنجاح" : "Payment order created",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (isArabic ? "فشل إنشاء طلب الدفع" : "Failed to create payment order"),
      );
    }
  };

  const handleCopyAddress = async () => {
    if (!orderData?.address) return;
    try {
      await navigator.clipboard.writeText(orderData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success(isArabic ? "تم نسخ العنوان" : "Address copied");
    } catch {
      toast.error(isArabic ? "تعذر النسخ" : "Copy failed");
    }
  };

  const handleVerifyTx = async () => {
    if (!manualTxHash.trim() || !orderId) {
      toast.error(
        isArabic ? "أدخل هاش المعاملة أولاً" : "Please enter the TX Hash first"
      );
      return;
    }

    try {
      const res = await verifyTxMutation.mutateAsync({
        orderId,
        txHash: manualTxHash.trim(),
      });
      const payload = pickPayload(res);
      toast.success(
        isArabic ? "تم التحقق من المعاملة بنجاح!" : "Transaction verified successfully!"
      );
      refetchOrderStatus();
      if (payload) {
        setOrder((prev) => ({ ...prev, ...payload }));
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          (isArabic ? "فشل التحقق من المعاملة" : "Transaction verification failed")
      );
    }
  };

  const handleGoSupport = () => {
    router.push(`/${locale}/support`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {t("sidebar.items.deposit")} USDT
            </h1>
            <p className="mt-1 text-white/70">
              {isArabic
                ? "إيداع فوري وتلقائي عبر البلوكتشين بدون تدخل الأدمن"
                : "Instant automatic deposit via blockchain without admin intervention"}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold text-yellow-400">
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
            {isArabic ? "الشبكة: BEP-20 (BNB Smart Chain)" : "Network: BEP-20 (BNB Smart Chain)"}
          </div>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2 sm:p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-white/80">
                  {isArabic ? "المبلغ الأساسي (USDT)" : "Base Amount (USDT)"}
                </label>
                <Input
                  type="number"
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(e.target.value)}
                  placeholder="100"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleCreateOrder}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isArabic ? "جاري الإنشاء..." : "Creating order..."}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    {isArabic ? "إنشاء طلب دفع BEP20" : "Create BEP20 Payment Order"}
                  </span>
                )}
              </Button>

              <div className="rounded-md border border-yellow-500/30 bg-[#161a20] p-4 text-sm text-white">
                <div className="mb-2 font-semibold text-yellow-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {isArabic ? "تعليمات الإيداع الآلي" : "Auto-Deposit Instructions"}
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-white/80">
                  <li>
                    {isArabic
                      ? "الشبكة المعتمدة: BEP-20 (BNB Smart Chain / BSC) فقط."
                      : "Supported network: BEP-20 (BNB Smart Chain / BSC) only."}
                  </li>
                  <li>
                    {isArabic
                      ? "يرجى تحويل نفس المبلغ المتوقع تماماً (بما يشمل الكسور) ليتم التعرف على معاملتك آلياً."
                      : "Please send the exact expected amount (including micro-decimals) for automatic matching."}
                  </li>
                  <li>
                    {isArabic
                      ? "يقوم النظام بفحص شبكة البلوكتشين تلقائياً كل 10 ثوانٍ وشحن المحفظة فوراً عند وصول التحويل."
                      : "The system polls the BSC blockchain every 10 seconds and automatically credits your wallet upon arrival."}
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-gray-600/40 bg-card p-4 sm:p-6">
              {!orderId || !orderData ? (
                <div className="grid h-full min-h-[220px] place-items-center text-sm text-white/55">
                  {isArabic
                    ? "أنشئ طلب دفع لعرض عنوان المحفظة والباركود والمبلغ المتوقع"
                    : "Create a payment order to view wallet address, QR, and expected amount"}
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/60">Order ID</span>
                    <span className="font-mono text-white text-xs">{orderData.order_id}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/60">
                      {isArabic ? "الشبكة" : "Network"}
                    </span>
                    <span className="rounded-md bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-400">
                      BEP-20 (BSC)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/60">
                      {isArabic ? "الحالة" : "Status"}
                    </span>
                    <span className="font-semibold text-primary">{status || "pending"}</span>
                  </div>
                  {isPending ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/60">
                        {isArabic ? "الوقت المتبقي" : "Time left"}
                      </span>
                      <span className="font-mono text-white">{remainingLabel}</span>
                    </div>
                  ) : null}

                  <div className="pt-2">
                    <div className="mb-1 text-xs text-white/60">
                      {isArabic ? "عنوان الإيداع (BEP-20)" : "Deposit Address (BEP-20)"}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={orderData.address || "--"}
                        className="bg-[#0b0e11] font-mono text-xs text-white"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyAddress}
                        className="border-gray-600/40"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border border-white/10 bg-[#0f1115] p-3">
                    <div className="mb-2 text-xs text-white/60">
                      {isArabic ? "باركود الدفع" : "Payment QR"}
                    </div>
                    <div className="grid place-items-center rounded-md bg-black/30 p-3">
                      {qrValue ? (
                        <img
                          src={qrValue}
                          alt={isArabic ? "باركود الإيداع" : "Deposit QR code"}
                          width={180}
                          height={180}
                          className="h-[180px] w-[180px] rounded-md"
                        />
                      ) : (
                        <Image
                          src="/qr.png"
                          alt={isArabic ? "باركود الإيداع" : "Deposit QR code"}
                          width={180}
                          height={180}
                          className="h-[180px] w-[180px] rounded-md opacity-70"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 rounded-md border border-white/10 bg-[#0f1115] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">{isArabic ? "المبلغ الأساسي" : "Base"}</span>
                      <span className="text-white">
                        {formatAmount(orderData.base_amount, locale)} USDT
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">{isArabic ? "كسور التمييز الآلي" : "Micro Amount"}</span>
                      <span className="text-white font-mono text-xs">
                        +{formatAmount(orderData.micro_amount, locale)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-2">
                      <span className="font-medium text-white/80">
                        {isArabic ? "المبلغ المتوقع تحويله" : "Expected Amount to Send"}
                      </span>
                      <span className="font-bold text-lg text-yellow-400">
                        {formatAmount(orderData.expected_amount, locale)} USDT
                      </span>
                    </div>
                  </div>

                  <div
                    className={`rounded-md border p-3 text-xs ${
                      isFinalSuccess
                        ? "border-green-500/30 bg-green-500/10 text-green-300"
                        : isMismatch
                          ? "border-red-500/30 bg-red-500/10 text-red-300"
                          : isExpired
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            : "border-blue-500/30 bg-blue-500/10 text-blue-300"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4" />
                      <div>
                        <div className="font-medium">{stateMessage}</div>
                        {orderData.tx_hash ? (
                          <div className="mt-1 font-mono text-white/70 break-all">
                            TX: {orderData.tx_hash}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {isPending && (
                    <div className="rounded-md border border-white/10 bg-[#0f1115] p-3 space-y-2">
                      <div className="text-xs text-white/70">
                        {isArabic
                          ? "هل أتممت التحويل؟ أدخل هاش المعاملة (TX Hash) للتحقق الفوري (اختياري):"
                          : "Transferred already? Enter TX Hash for instant verification (optional):"}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={manualTxHash}
                          onChange={(e) => setManualTxHash(e.target.value)}
                          placeholder="0x..."
                          className="bg-[#0b0e11] font-mono text-xs text-white"
                        />
                        <Button
                          size="sm"
                          onClick={handleVerifyTx}
                          disabled={verifyTxMutation.isPending || !manualTxHash.trim()}
                          className="whitespace-nowrap"
                        >
                          {verifyTxMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Zap className="h-3 w-3" />
                          )}
                          <span className="ml-1">
                            {verifyTxMutation.isPending
                              ? (isArabic ? "جاري التحقق..." : "Verifying...")
                              : (isArabic ? "تحقق فوري" : "Verify")}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {isMismatch ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoSupport}
                    >
                      {isArabic ? "التوجه إلى الدعم" : "Go to Support"}
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <SupportButton className="fixed bottom-6 z-50 ltr:right-6 rtl:left-6" />
    </div>
  );
}
