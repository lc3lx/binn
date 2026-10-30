"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  Info,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowDownLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  ClipboardPaste,
  Sparkles,
  Zap,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { useRequestWithdrawMutation } from "@/api/services/user/Withdraw/withdraw.query";
import { useDashboardSummaryQuery } from "@/api/services/user/Statistics/statistics.query";
import { useTransactionsListQuery } from "@/api/services/user/Transactions/transactions.query";
import { formatApiError } from "@/lib/format-error";

export default function WithdrawPage() {
  const { t, locale } = useTranslations();
  const isArabic = locale === "ar";
  const withdrawMutation = useRequestWithdrawMutation();
  const { data: summaryResponse, refetch: refetchSummary } = useDashboardSummaryQuery();
  const { data: transactionsResponse, refetch: refetchTransactions } = useTransactionsListQuery();

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [isArabic],
  );

  const summary = summaryResponse?.data || {};
  const balance = Number(summary?.walletBalance || 0);
  const minWithdrawal = 2.5;

  // Weekend Rule: Saturday (6) and Sunday (0) are official holidays for withdrawals
  const today = new Date();
  const dayOfWeek = today.getUTCDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const currentNet = {
    key: "bsc",
    label: isArabic ? "BNB Smart Chain (BEP-20)" : "BNB Smart Chain (BEP-20)",
    fee: 0.5,
    placeholder: "0x...",
  };

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("cash out");
  const [activeTab, setActiveTab] = useState("withdraw"); // 'withdraw' | 'history'

  const parsedAmount = useMemo(() => {
    const a = parseFloat(amount);
    return Number.isFinite(a) ? Math.max(0, a) : 0;
  }, [amount]);

  const receive = Math.max(0, Number((parsedAmount - currentNet.fee).toFixed(2)));
  const insufficient = parsedAmount > balance;
  const isBelowMin = parsedAmount > 0 && parsedAmount < minWithdrawal;
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address.trim());

  const invalid =
    !address.trim() ||
    !isValidAddress ||
    parsedAmount <= 0 ||
    insufficient ||
    parsedAmount < minWithdrawal;

  const handleQuickPercent = (pct) => {
    if (balance <= 0) return;
    const calc = Number(((balance * pct) / 100).toFixed(2));
    setAmount(String(calc));
  };

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddress(text.trim());
        toast.success(isArabic ? "تم لصق العنوان" : "Address pasted");
      }
    } catch {
      toast.error(isArabic ? "تعذر قراءة الحافظة" : "Clipboard access denied");
    }
  };

  const handleWithdraw = async () => {
    if (invalid) {
      if (!isValidAddress) {
        toast.error(
          isArabic
            ? "عنوان المحفظة غير صالح. يجب أن يبدأ بـ 0x ويتكون من 42 خانة"
            : "Invalid BEP-20 address. Must start with 0x and have 42 characters."
        );
        return;
      }
      if (parsedAmount < minWithdrawal) {
        toast.error(
          isArabic
            ? `الحد الأدنى للسحب هو ${minWithdrawal} USDT`
            : `Minimum withdrawal is ${minWithdrawal} USDT`
        );
        return;
      }
      if (insufficient) {
        toast.error(
          isArabic ? "رصيد المحفظة غير كافٍ" : "Insufficient wallet balance"
        );
        return;
      }
      return;
    }

    try {
      const res = await withdrawMutation.mutateAsync({
        amount: parsedAmount,
        walletAddress: address.trim(),
        withdrawalFee: Number(currentNet.fee),
        note: note.trim() || "cash out",
      });
      toast.success(
        res?.message ||
          (isArabic
            ? "تم تقديم طلب السحب وخصم المبلغ من محفظتك بنجاح! ستتم المعالجة خلال 48 ساعة."
            : "Withdrawal request submitted successfully! Processing within 48 hours.")
      );
      setAmount("");
      setAddress("");
      refetchSummary();
      refetchTransactions();
      setActiveTab("history");
    } catch (error) {
      toast.error(formatApiError(error, locale));
    }
  };

  // Filter user's transactions for withdrawals
  const withdrawalTransactions = useMemo(() => {
    const list = transactionsResponse?.data;
    if (!Array.isArray(list)) return [];
    return list.filter((tx) => tx.type === "withdraw");
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
      className="min-h-screen p-3 sm:p-6 pb-28 text-white max-w-4xl mx-auto space-y-6"
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-[#071326] via-[#0b1c38] to-[#071326] p-5 sm:p-6 rounded-3xl border border-cyan-500/25 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-black font-black">
              <ArrowDownLeft className="h-5 w-5 stroke-[2.5]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {isArabic ? "سحب أرباح المحفظة" : "Withdraw USDT"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-cyan-200/70">
            {isArabic
              ? "سحب فوري ومباشر إلى محفظة BEP-20 الخاصة بك بدون أي شروط هوية"
              : "Direct withdrawal to your personal BEP-20 wallet with zero KYC"}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 shadow-md">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            {isArabic ? "الشبكة: BEP-20 (BNB Smart Chain)" : "Network: BEP-20 (BSC)"}
          </span>
        </div>
      </div>

      {/* 2. Processing & Weekend Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 48-Hour Guarantee Notice */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-cyan-500/25 flex items-start gap-3 shadow-lg">
          <Clock className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-white">
              {isArabic
                ? "مدة تنفيذ التحويل: خلال 48 ساعة كحد أقصى"
                : "Processing Time: Within 48 Hours Max"}
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isArabic
                ? "تتم مراجعة ومعالجة كافة طلبات السحب وتحويلها لمحفظتك خلال 48 ساعة من وقت الطلب (أيام العمل: الإثنين - الجمعة)."
                : "All withdrawal requests are processed and sent to your address within 48 hours (Monday to Friday)."}
            </p>
          </div>
        </div>

        {/* Weekend Notice */}
        <div
          className={`p-4 rounded-3xl border flex items-start gap-3 shadow-lg ${
            isWeekend
              ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
              : "bg-slate-900/80 border-slate-700/60 text-slate-300"
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              isWeekend ? "text-amber-400 animate-pulse" : "text-slate-400"
            }`}
          />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-white">
              {isArabic
                ? "عطلة نهاية الأسبوع (السبت والأحد)"
                : "Weekend Holiday (Saturday & Sunday)"}
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-300/90">
              {isWeekend
                ? isArabic
                  ? "قسم السحوبات مغلق حالياً بمناسبة عطلة نهاية الأسبوع. يستأنف تقديم ومعالجة الطلبات صباح يوم الإثنين."
                  : "Withdrawal submissions are closed during weekend holiday. Reopening Monday morning."
                : isArabic
                ? "السحب متاح يومياً من الإثنين إلى الجمعة. العطلة الرسمية لقسم التحويلات هي السبت والأحد فقط."
                : "Withdrawals are open Monday to Friday. Processing is paused on weekends."}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs (طلب سحب جديد / سجل السحوبات) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 shadow-md ${
            activeTab === "withdraw"
              ? "bg-[#0c2a54] text-white border border-blue-500/50 shadow-blue-900/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
          }`}
        >
          {isArabic ? "طلب سحب جديد" : "New Withdrawal"}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
            activeTab === "history"
              ? "bg-[#0c2a54] text-white border border-blue-500/50 shadow-blue-900/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isArabic ? "سجل السحوبات" : "Withdrawal History"}</span>
          {withdrawalTransactions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
              {withdrawalTransactions.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. TAB: WITHDRAW FORM */}
      {activeTab === "withdraw" && (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-700/60 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-6">
          {/* Balance Display Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#081326] border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </span>
              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-0.5">
                  {isArabic ? "الرصيد القابل للسحب حالياً" : "Available Balance to Withdraw"}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    ${nf.format(balance)}
                  </span>
                  <span className="text-xs font-bold text-cyan-400">USDT</span>
                </div>
              </div>
            </div>

            {/* Quick Percentage Chips */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickPercent(pct)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700/60 hover:border-cyan-500/40 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
                >
                  {pct === 100 ? (isArabic ? "الكل (Max)" : "Max") : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Network Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              {isArabic ? "شبكة التحويل المعتمدة:" : "Withdrawal Network:"}
            </label>
            <div className="p-3 rounded-2xl bg-[#0b172c] border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 flex items-center justify-center font-black text-xs">
                  BSC
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    BNB Smart Chain (BEP-20)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isArabic ? "رسوم الغاز والتحويل مخفضة جداً" : "Low network transfer fee"}
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                Fee: {nf.format(currentNet.fee)} USDT
              </span>
            </div>
          </div>

          {/* BEP-20 Wallet Address Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                {isArabic ? "عنوان محفظتك (BEP-20 USDT):" : "Your BEP-20 USDT Address:"}
              </label>
              {address && (
                <span
                  className={`text-[10px] font-bold flex items-center gap-1 ${
                    isValidAddress ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {isValidAddress ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isArabic ? "عنوان BEP-20 صحيح" : "Valid BEP-20 address"}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {isArabic ? "يجب أن يبدأ بـ 0x (42 حرف)" : "Must start with 0x (42 chars)"}
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="relative">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="h-12 rounded-2xl bg-[#0b172c] border border-cyan-500/30 text-white font-mono text-xs sm:text-sm pl-4 pr-20 focus-visible:ring-cyan-400"
              />
              <button
                type="button"
                onClick={handlePasteAddress}
                className="absolute top-1/2 -translate-y-1/2 ltr:right-2.5 rtl:left-2.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1 border border-cyan-500/30 transition-all active:scale-95"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>{isArabic ? "لصق" : "Paste"}</span>
              </button>
            </div>
          </div>

          {/* Amount to Withdraw */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                {isArabic ? "المبلغ المطلوب سحبه (USDT):" : "Amount to Withdraw (USDT):"}
              </label>
              <span className="text-[11px] text-slate-400">
                {isArabic ? `الحد الأدنى: ${minWithdrawal} USDT` : `Minimum: ${minWithdrawal} USDT`}
              </span>
            </div>

            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className="h-12 rounded-2xl bg-[#0b172c] border border-cyan-500/30 text-white font-bold text-base px-4 focus-visible:ring-cyan-400"
              />
              <span className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 text-xs font-black text-cyan-400">
                USDT
              </span>
            </div>

            {insufficient && (
              <p className="text-xs font-bold text-red-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {isArabic ? "المبلغ المطلوب أكبر من رصيدك المتاح" : "Amount exceeds available balance"}
              </p>
            )}

            {isBelowMin && (
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {isArabic
                  ? `الحد الأدنى للسحب هو ${minWithdrawal} USDT`
                  : `Minimum withdrawal is ${minWithdrawal} USDT`}
              </p>
            )}
          </div>

          {/* Breakdown / Net Receive Card */}
          <div className="p-4 rounded-2xl bg-[#081326] border border-cyan-500/20 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>{isArabic ? "المبلغ الإجمالي للسحب:" : "Gross Amount:"}</span>
              <span className="font-bold text-white font-mono">${nf.format(parsedAmount)} USDT</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>{isArabic ? "رسوم التحويل والغاز (BEP-20):" : "Network Transfer Fee:"}</span>
              <span className="font-bold text-amber-400 font-mono">-{nf.format(currentNet.fee)} USDT</span>
            </div>

            <div className="border-t border-slate-700/60 pt-2.5 flex items-center justify-between text-sm sm:text-base font-extrabold">
              <span className="text-white">{isArabic ? "صافي المبلغ الذي ستستلمه:" : "Net You Receive:"}</span>
              <span className="font-black text-emerald-400 font-mono text-lg">
                ${nf.format(receive)} USDT
              </span>
            </div>
          </div>

          {/* Action Submit Button */}
          <Button
            type="button"
            disabled={invalid || isWeekend || withdrawMutation.isPending}
            onClick={handleWithdraw}
            className={`w-full py-6 rounded-2xl font-extrabold text-base shadow-xl transition-all active:scale-[0.98] ${
              invalid || isWeekend
                ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-900/40 border border-cyan-400 animate-pulse"
            }`}
          >
            {isWeekend
              ? isArabic
                ? "السحب مغلق في عطلة نهاية الأسبوع (السبت والأحد)"
                : "Withdrawals Closed on Weekends (Sat & Sun)"
              : withdrawMutation.isPending
              ? isArabic ? "جاري تقديم الطلب وخصم المبلغ..." : "Submitting..."
              : isArabic
              ? `تأكيد طلب سحب ${nf.format(parsedAmount)} USDT`
              : `Confirm Withdrawal of ${nf.format(parsedAmount)} USDT`}
          </Button>
        </div>
      )}

      {/* 5. TAB: WITHDRAWAL HISTORY */}
      {activeTab === "history" && (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-700/60 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <span>{isArabic ? "سجل طلبات السحب والحوالات" : "Withdrawal Requests History"}</span>
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

          {withdrawalTransactions.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <ArrowDownLeft className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white">
                {isArabic ? "لا توجد طلبات سحب حتى الآن" : "No withdrawal requests yet"}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isArabic
                  ? "عند قيامك بسحب أرباحك، ستظهر جميع الطلبات وحالات المعالجة وعناوين البلوكتشين هنا."
                  : "When you request a withdrawal, details and status updates will be logged here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawalTransactions.map((tx) => {
                const isPending = tx.status === "pending";
                const isApproved = tx.status === "approved";
                const isPaid = tx.status === "paid" || tx.status === "completed";
                const isRejected = tx.status === "rejected";

                return (
                  <div
                    key={tx._id}
                    className="p-4 rounded-2xl bg-[#081326] border border-slate-700/60 hover:border-cyan-500/30 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-300 font-bold text-sm">
                          ${tx.amount} USDT
                        </span>
                        {tx.netAmount != null && tx.netAmount !== tx.amount && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({isArabic ? "صافي:" : "Net:"} ${tx.netAmount})
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isApproved
                            ? "bg-blue-500/10 text-cyan-300 border-blue-500/30"
                            : isRejected
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {isPaid
                          ? isArabic ? "تم التحويل بنجاح" : "Paid Successfully"
                          : isApproved
                          ? isArabic ? "تمت الموافقة (جاري الإرسال)" : "Approved (Sending)"
                          : isRejected
                          ? isArabic ? "مرفوض وتم استرجاع الرصيد" : "Rejected & Refunded"
                          : isArabic ? "قيد المراجعة (خلال 48 ساعة)" : "Pending Review (within 48h)"}
                      </span>
                    </div>

                    {/* Address & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <div className="font-mono truncate max-w-xs">
                        {isArabic ? "إلى:" : "To:"} {tx.walletAddress || "--"}
                      </div>
                      <div>{formatDate(tx.createdAt)}</div>
                    </div>

                    {/* Rejection Reason if any */}
                    {isRejected && tx.rejectionReason && (
                      <div className="p-2 rounded-xl bg-red-950/30 border border-red-900/40 text-red-300 text-[11px]">
                        <span className="font-bold">{isArabic ? "سبب الرفض:" : "Reason:"} </span>
                        {tx.rejectionReason}
                      </div>
                    )}

                    {/* Blockchain TX link if available */}
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
    </div>
  );
}
