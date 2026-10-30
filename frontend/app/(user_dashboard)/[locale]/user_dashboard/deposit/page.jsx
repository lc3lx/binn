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
  ClipboardPaste,
  History,
  QrCode,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SupportButton from "@/components/site/SupportButton";
import {
  useCreatePaymentOrderMutation,
  usePaymentOrderStatusQuery,
  useVerifyPaymentTxMutation,
} from "@/api/services/user/deposit/deposit.query";
import { useTransactionsListQuery } from "@/api/services/user/Transactions/transactions.query";
import { useDashboardSummaryQuery } from "@/api/services/user/Statistics/statistics.query";
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

  const [activeTab, setActiveTab] = useState("deposit"); // 'deposit' | 'verify' | 'history'
  const [baseAmount, setBaseAmount] = useState("50");
  const [order, setOrder] = useState(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [manualTxHash, setManualTxHash] = useState("");

  const successNotifiedRef = useRef(false);
  const detectedNotifiedRef = useRef(false);

  const createOrderMutation = useCreatePaymentOrderMutation();
  const verifyTxMutation = useVerifyPaymentTxMutation();
  const { refetch: refetchSummary } = useDashboardSummaryQuery();
  const { data: transactionsResponse, refetch: refetchTransactions } = useTransactionsListQuery();

  const orderId = order?.order_id || "";
  const { data: orderStatusResponse, refetch: refetchOrderStatus } =
    usePaymentOrderStatusQuery(orderId, {
      enabled: Boolean(orderId),
      refetchInterval: orderId ? 7000 : false,
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
          ? "تم كشف التحويل عبر البلوكتشين، جاري إضافة الرصيد لمحفظتك..."
          : "Payment detected on BSC, crediting your wallet..."
      );
    }

    if (status === "paid" && creditedAt && !successNotifiedRef.current) {
      successNotifiedRef.current = true;
      toast.success(
        isArabic
          ? "تهانينا! تمت إضافة الرصيد إلى محفظتك بنجاح!"
          : "Congratulations! Deposit credited to your wallet successfully!"
      );
      refetchSummary();
      refetchTransactions();
    }
  }, [isArabic, orderData?.credited_at, orderData?.status, refetchSummary, refetchTransactions]);

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
          ? "تم إنشاء طلب الدفع الآلي بنجاح! يمكنك الآن تحويل المبلغ المطلوب."
          : "Automated payment order created! Please transfer the exact amount."
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

  const handlePasteTx = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setManualTxHash(text.trim());
        toast.success(isArabic ? "تم لصق الهاش" : "TX Hash pasted");
      }
    } catch {
      toast.error(isArabic ? "تعذر قراءة الحافظة" : "Clipboard access denied");
    }
  };

  const handleVerifyTx = async () => {
    const cleanHash = manualTxHash.trim();
    if (!cleanHash) {
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
        txHash: cleanHash,
        walletAddress: activeAddress,
        amount: Number(baseAmount) || 50,
      });
      const payload = pickPayload(res);
      toast.success(
        res?.message ||
          (isArabic
            ? "تم التحقق من المعاملة بنجاح وقيد الرصيد!"
            : "Transaction verified and credited successfully!")
      );
      setManualTxHash("");
      refetchSummary();
      refetchTransactions();
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

  // Filter user's transactions for deposits
  const depositTransactions = useMemo(() => {
    const list = transactionsResponse?.data;
    if (!Array.isArray(list)) return [];
    return list.filter((tx) => tx.type === "deposit");
  }, [transactionsResponse?.data]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return d.toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

      {/* 2. Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          onClick={() => setActiveTab("deposit")}
          className={`py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 ${
            activeTab === "deposit"
              ? "bg-[#0c2a54] text-white border border-blue-500/50 shadow-blue-900/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{isArabic ? "إيداع آلي (QR)" : "Auto Deposit"}</span>
        </button>

        <button
          onClick={() => setActiveTab("verify")}
          className={`py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 ${
            activeTab === "verify"
              ? "bg-[#0c2a54] text-white border border-blue-500/50 shadow-blue-900/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{isArabic ? "تأكيد هاش المعاملة" : "Verify TX"}</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 ${
            activeTab === "history"
              ? "bg-[#0c2a54] text-white border border-blue-500/50 shadow-blue-900/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isArabic ? "سجل الإيداعات" : "History"}</span>
          {depositTransactions.length > 0 && (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
              {depositTransactions.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. TAB: AUTO DEPOSIT */}
      {activeTab === "deposit" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Preset Amounts & Control (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#081223] rounded-3xl border border-cyan-500/20 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  {isArabic ? "اختر باقة الاستثمار المطلوبة:" : "Select Investment Tier:"}
                </h2>
                <span className="text-[11px] font-bold text-cyan-400">
                  {isArabic ? "عائد 5% يومياً" : "5% Daily Yield"}
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
                      onClick={() => setBaseAmount(String(tItem.amount))}
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
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  {isArabic ? "المبلغ المراد شحنه (USDT):" : "Amount to Deposit (USDT):"}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(e.target.value)}
                    placeholder="50"
                    className="h-12 rounded-2xl bg-[#0b172c] border border-cyan-500/30 text-white text-base font-bold px-4 focus-visible:ring-cyan-400"
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

          {/* Right Column: Deposit Address & QR Code (7 cols) */}
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

              {/* Direct Verification Callout */}
              <div className="p-3.5 rounded-2xl bg-[#0c1a32] border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300">
                  {isArabic
                    ? "هل قمت بالتحويل بالفعل؟ اضغط هنا لتأكيد المعاملة فوراً عبر الهاش."
                    : "Sent USDT already? Click to verify instantly using transaction hash."}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("verify")}
                  className="shrink-0 border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 font-bold text-xs"
                >
                  {isArabic ? "تأكيد الهاش" : "Verify Hash"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: VERIFY TX HASH */}
      {activeTab === "verify" && (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-700/60 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-w-2xl mx-auto">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>{isArabic ? "التحقق الفوري من هاش المعاملة (TX Hash)" : "Instant TX Hash Verification"}</span>
            </h3>
            <p className="text-xs text-slate-300">
              {isArabic
                ? "إذا قمت بتحويل USDT عبر Binance أو TrustWallet أو MetaMask، الصق هاش المعاملة هنا ليتم قيد الرصيد فوراً في محفظتك."
                : "If you transferred USDT via Binance, TrustWallet, or MetaMask, paste the TX hash below for immediate crediting."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                value={manualTxHash}
                onChange={(e) => setManualTxHash(e.target.value)}
                placeholder="0x..."
                className="h-14 rounded-2xl bg-[#0b172c] border border-cyan-500/30 font-mono text-xs sm:text-sm text-white px-4 pr-24 focus-visible:ring-cyan-400"
              />
              <button
                type="button"
                onClick={handlePasteTx}
                className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1 border border-cyan-500/30 transition-all active:scale-95"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>{isArabic ? "لصق" : "Paste"}</span>
              </button>
            </div>

            <Button
              type="button"
              onClick={handleVerifyTx}
              disabled={verifyTxMutation.isPending || !manualTxHash.trim()}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm shadow-xl transition-all active:scale-[0.98]"
            >
              {verifyTxMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? "جاري الفحص المباشر عبر البلوكتشين..." : "Verifying on blockchain..."}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
                  {isArabic ? "تحقق وإضافة الرصيد فوراً" : "Verify & Credit Now"}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 5. TAB: DEPOSIT HISTORY */}
      {activeTab === "history" && (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-700/60 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <span>{isArabic ? "سجل عمليات الإيداع والشحن" : "Deposit History"}</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchTransactions()}
              className="text-xs text-cyan-300 hover:text-white"
            >
              {isArabic ? "تحديث السجل" : "Refresh"}
            </Button>
          </div>

          {depositTransactions.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Wallet className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white">
                {isArabic ? "لا توجد عمليات إيداع مسجلة حتى الآن" : "No deposit transactions yet"}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isArabic
                  ? "عند قيامك بإيداع مبالغ، ستظهر تفاصيل الحوالة وحالة التأكيد وتاريخها هنا."
                  : "All completed and pending deposits will be logged here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {depositTransactions.map((tx) => {
                const isConfirmed = tx.status === "confirmed" || tx.status === "completed";
                const isPending = tx.status === "pending";
                const isRejected = tx.status === "rejected";

                return (
                  <div
                    key={tx._id}
                    className="p-4 rounded-2xl bg-[#081326] border border-slate-700/60 hover:border-cyan-500/30 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        +${tx.amount} USDT
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                          isConfirmed
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isRejected
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {isConfirmed
                          ? isArabic ? "مؤكد ومضاف للمحفظة" : "Confirmed & Credited"
                          : isRejected
                          ? isArabic ? "مرفوض" : "Rejected"
                          : isArabic ? "قيد المراجعة / التأكيد" : "Pending Confirmation"}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <div>{formatDate(tx.createdAt)}</div>
                      {tx.note && <div className="text-slate-300 font-medium">{tx.note}</div>}
                    </div>

                    {tx.txHash && (
                      <div className="pt-1">
                        <a
                          href={`https://bscscan.com/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline font-mono"
                        >
                          <span>{isArabic ? "عرض المعاملة على BscScan" : "View on BscScan"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <SupportButton className="fixed bottom-6 z-50 ltr:right-6 rtl:left-6" />
    </div>
  );
}
