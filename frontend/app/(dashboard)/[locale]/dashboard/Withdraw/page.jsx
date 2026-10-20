﻿"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "@/hooks/useTranslations";
import { formatLocalizedDate } from "@/lib/format-localized-date";
import {
  useMarkWithdrawalAsPaidMutation,
  useNotifyWithdrawalUserMutation,
  useReviewWithdrawalMutation,
  useWithdrawListQuery,
} from "@/api/services/admin/withdraw/withdraw.query";
import WithdrawReviewDialog from "./components/withdraw-review-dialog";
import WithdrawNotifyDialog from "./components/withdraw-notify-dialog";

const PAGE_SIZE = 10;

const copy = {
  en: {
    title: "Withdrawals Management",
    subtitle: (count) => `${count} pending withdrawal requests`,
    searchPlaceholder: "Search by user, email, request code, or wallet...",
    tabs: {
      all: "All",
      paid: "Paid",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    },
    cards: {
      pendingAmount: "Pending Amount",
      pendingRequests: "Pending Requests",
      todayPaidOut: "Today Paid Out",
    },
    columns: {
      id: "Request ID",
      user: "User",
      wallet: "Wallet Address",
      amount: "Amount",
      fee: "Fee",
      netAmount: "Net Amount",
      status: "Status",
      date: "Date",
      actions: "Actions",
    },
    labels: {
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected",
      paid: "Paid",
      copySuccess: "Wallet address copied",
      unknownUser: "Unknown User",
      approve: "Approve",
      reject: "Reject",
      markPaid: "Mark Paid",
      noted: "Noted",
      reviewSuccess: "Withdrawal status updated successfully",
      reviewError: "Failed to update withdrawal status",
      rejectionRequired: "Rejection reason is required",
      markPaidSuccess: "Withdrawal marked as paid",
      markPaidError: "Failed to mark withdrawal as paid",
    },
    states: {
      loading: "Loading withdrawals...",
      empty: "No withdrawal requests found.",
      error: "Failed to load withdrawals.",
    },
    footer: {
      showing: "SHOWING",
      to: "TO",
      of: "OF",
      entries: "ENTRIES",
    },
  },
  ar: {
    title: "إدارة السحوبات",
    subtitle: (count) => `${count} طلبات سحب بانتظار المراجعة`,
    searchPlaceholder: "ابحث بالمستخدم أو البريد أو رقم الطلب أو المحفظة...",
    tabs: {
      all: "الكل",
      paid: "مدفوع",
      pending: "قيد الانتظار",
      approved: "مقبول",
      rejected: "مرفوض",
    },
    cards: {
      pendingAmount: "مبلغ بانتظار السحب",
      pendingRequests: "طلبات قيد الانتظار",
      todayPaidOut: "المدفوع اليوم",
    },
    columns: {
      id: "رقم الطلب",
      user: "المستخدم",
      wallet: "عنوان المحفظة",
      amount: "المبلغ",
      fee: "الرسوم",
      netAmount: "الصافي",
      status: "الحالة",
      date: "التاريخ",
      actions: "الإجراءات",
    },
    labels: {
      approved: "مقبول",
      pending: "قيد الانتظار",
      rejected: "مرفوض",
      paid: "مدفوع",
      copySuccess: "تم نسخ عنوان المحفظة",
      unknownUser: "مستخدم غير معروف",
      approve: "قبول",
      reject: "رفض",
      markPaid: "تحديد كمدفوع",
      noted: "ملاحظة",
      reviewSuccess: "تم تحديث حالة السحب بنجاح",
      reviewError: "تعذر تحديث حالة السحب",
      rejectionRequired: "سبب الرفض مطلوب",
      markPaidSuccess: "تم تحديد السحب كمدفوع",
      markPaidError: "تعذر تحديد السحب كمدفوع",
    },
    states: {
      loading: "جارٍ تحميل طلبات السحب...",
      empty: "لا توجد طلبات سحب.",
      error: "تعذر تحميل طلبات السحب.",
    },
    footer: {
      showing: "إظهار",
      to: "إلى",
      of: "من",
      entries: "مدخلات",
    },
  },
};

const statusStyles = {
  approved: "bg-primary/15 text-primary",
  pending: "bg-ring/10 text-ring",
  rejected: "bg-destructive/20 text-destructive",
  paid: "bg-emerald-500/20 text-emerald-400",
};

function normalizeStatus(status) {
  return String(status || "pending").toLowerCase();
}

export default function AdminWithdrawPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const text = copy[locale] || copy.en;

  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const [reviewState, setReviewState] = useState({
    open: false,
    status: "approved",
    transactionId: "",
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState("");
  const [notifyState, setNotifyState] = useState({
    open: false,
    transactionId: "",
  });
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyError, setNotifyError] = useState("");

  const { data, isLoading, isError, isFetching } = useWithdrawListQuery({
    status: selectedTab,
    page,
    limit: PAGE_SIZE,
  });

  const reviewMutation = useReviewWithdrawalMutation({
    onSuccess: () => toast.success(text.labels.reviewSuccess),
    onError: () => toast.error(text.labels.reviewError),
  });
  const markPaidMutation = useMarkWithdrawalAsPaidMutation({
    onSuccess: () => toast.success(text.labels.markPaidSuccess),
    onError: () => toast.error(text.labels.markPaidError),
  });
  const notifyMutation = useNotifyWithdrawalUserMutation({
    onSuccess: () =>
      toast.success(
        isArabic ? "طھظ… ط¥ط´ط¹ط§ط± ط§ظ„ظ…ط³طھط®ط¯ظ… ط¨ظ†ط¬ط§ط­" : "User notified successfully",
      ),
        onError: (error) => {
      const backendMessage =
        error?.response?.data?.message || error?.message || "";
      toast.error(
        backendMessage ||
          (isArabic
            ? "تعذر إشعار المستخدم"
            : "Failed to notify user"),
      );
    },
  });

  const payload = data ?? {};
  const counters = payload?.counters || {};
  const pagination = payload?.pagination || {};
  const serverRows = Array.isArray(payload?.data) ? payload.data : [];
  const currency = counters.currency || "USD";

  const totalCount = Number(pagination.total ?? serverRows.length) || 0;
  const totalPages =
    Number(pagination.totalPages) || Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const visiblePages = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 2) return [1, 2, 3];
    if (page >= totalPages - 1) return [totalPages - 2, totalPages - 1, totalPages];
    return [page - 1, page, page + 1];
  }, [page, totalPages]);

  const rows = serverRows.map((item) => ({
    transactionId: item.transactionId,
    id: item.requestCode || item.transactionId || "--",
    user: item?.user?.name || text.labels.unknownUser,
    userEmail: item?.user?.email || "",
    wallet: item.walletAddress || "--",
    amount: Number(item.amount || 0),
    fee: Number(item.fee || 0),
    netAmount: Number(item.netAmount || 0),
    status: normalizeStatus(item.status),
    date: formatLocalizedDate(item.date, locale, { includeTime: true }),
  }));

  const filteredRows = (() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      `${row.id} ${row.user} ${row.userEmail} ${row.wallet}`.toLowerCase().includes(q),
    );
  })();

  const summaryCards = [
    {
      label: text.cards.pendingAmount,
      valueClass: "text-primary",
      value: new Intl.NumberFormat(isArabic ? "ar" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(counters.pendingAmount || 0)),
    },
    {
      label: text.cards.pendingRequests,
      valueClass: "text-primary",
      value: `${Number(counters.pendingRequests || 0)}`,
    },
    {
      label: text.cards.todayPaidOut,
      valueClass: "text-[#3b82f6]",
      value: new Intl.NumberFormat(isArabic ? "ar" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(counters.todayPaidOut || 0)),
    },
  ];

  const showingFrom = filteredRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo =
    filteredRows.length === 0
      ? 0
      : Math.min((page - 1) * PAGE_SIZE + filteredRows.length, totalCount);

  const tabs = [
    { key: "all", label: text.tabs.all },
    { key: "paid", label: text.tabs.paid },
    { key: "pending", label: text.tabs.pending },
    { key: "approved", label: text.tabs.approved },
    { key: "rejected", label: text.tabs.rejected },
  ];

  const openReviewDialog = (transactionId, status) => {
    setReviewState({ open: true, transactionId, status });
    setRejectionReason("");
    setRejectionReasonError("");
  };

  const closeReviewDialog = () => {
    setReviewState((prev) => ({ ...prev, open: false, transactionId: "" }));
    setRejectionReason("");
    setRejectionReasonError("");
  };

  const openNotifyDialog = (transactionId) => {
    setNotifyState({ open: true, transactionId });
    setNotifyMessage("Your withdrawal has been paid.");
    setNotifyError("");
  };

  const closeNotifyDialog = () => {
    setNotifyState({ open: false, transactionId: "" });
    setNotifyMessage("");
    setNotifyError("");
  };

  const handleReview = () => {
    if (!reviewState.transactionId) return;
    if (reviewState.status === "rejected" && !rejectionReason.trim()) {
      setRejectionReasonError(text.labels.rejectionRequired);
      return;
    }

    reviewMutation.mutate({
      transactionId: reviewState.transactionId,
      payload: {
        status: reviewState.status,
        rejectionReason:
          reviewState.status === "rejected" ? rejectionReason.trim() : "",
      },
    });
    closeReviewDialog();
  };

  const handleNotify = () => {
    if (!notifyState.transactionId) return;
    if (!notifyMessage.trim()) {
      setNotifyError(isArabic ? "ط§ظ„ط±ط³ط§ظ„ط© ظ…ط·ظ„ظˆط¨ط©" : "Message is required");
      return;
    }

    notifyMutation.mutate(
      {
        transactionId: notifyState.transactionId,
        payload: { message: notifyMessage.trim() },
      },
      {
        onSuccess: () => {
          closeNotifyDialog();
        },
      },
    );
  };

  return (
    <div
      className={`min-h-screen p-4 text-white sm:p-6 ${
        isArabic ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold leading-none text-white">{text.title}</h1>
          <p className="mt-2 text-sm text-white/45">
            {text.subtitle(Number(counters.pendingRequests || 0))}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[8px] border border-white/5 bg-sidebar p-4"
            >
              <div className="text-[11px] text-white/45">{card.label}</div>
              <div className={`mt-3 text-2xl font-semibold ${card.valueClass}`}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[8px] border border-white/5 bg-sidebar p-3">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full max-w-[420px]">
              <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 ltr:left-3 rtl:right-3" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={text.searchPlaceholder}
                className="h-10 rounded-[8px] border-white/10 bg-[#2e2e30] text-sm text-white placeholder:text-white/25 ltr:pl-9 rtl:pr-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => {
                const isActive = selectedTab === tab.key;
                return (
                  <Button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setSelectedTab(tab.key);
                      setPage(1);
                    }}
                    className={`h-8 rounded-md px-3 text-xs ${
                      isActive
                        ? "bg-primary text-black hover:bg-primary/90"
                        : "border border-white/10 bg-[#2e2e30] text-white/55 hover:bg-[#353537]"
                    }`}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <Table className="rounded-[6px] border-0">
            <TableHeader className="bg-[#363638]">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="h-11 px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {text.columns.id}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {text.columns.user}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {text.columns.wallet}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {text.columns.amount}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {text.columns.fee}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {text.columns.netAmount}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {text.columns.status}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {text.columns.date}
                </TableHead>
                <TableHead className="px-4 text-right text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {text.columns.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-b border-white/8">
                  <TableCell
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-white/45"
                  >
                    {text.states.loading}
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow className="border-b border-white/8">
                  <TableCell
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-[#ef4444]"
                  >
                    {text.states.error}
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow className="border-b border-white/8">
                  <TableCell
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-white/45"
                  >
                    {text.states.empty}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row, index) => (
                  <TableRow
                    key={`${row.id}-${index}`}
                    className="h-[50px] border-b border-white/8 hover:bg-white/[0.02]"
                  >
                    <TableCell className="px-4 py-3 text-xs text-[#60a5fa]">
                      {row.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold text-white">
                      {row.user}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-white/45">
                      <div className="flex items-center gap-2">
                        <span>{row.wallet}</span>
                        {row.wallet !== "--" ? (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(row.wallet);
                                toast.success(text.labels.copySuccess);
                              } catch {}
                            }}
                            className="text-white/45 transition-colors hover:text-white/65"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold text-primary">
                      {new Intl.NumberFormat(isArabic ? "ar" : "en-US", {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 2,
                      }).format(row.amount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold text-[#ef4444]">
                      {new Intl.NumberFormat(isArabic ? "ar" : "en-US", {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 2,
                      }).format(row.fee)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold text-white">
                      {new Intl.NumberFormat(isArabic ? "ar" : "en-US", {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 2,
                      }).format(row.netAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${
                          statusStyles[row.status] || statusStyles.pending
                        }`}
                      >
                        {text.labels[row.status] || row.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-white/45">
                      {row.date}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {row.status === "pending" ? (
                          <>
                            <Button
                              type="button"
                              onClick={() =>
                                openReviewDialog(row.transactionId, "approved")
                              }
                              className="h-7 rounded-md border border-primary/25 bg-primary/10 px-3 text-[10px] text-primary hover:bg-primary/15"
                            >
                              {text.labels.approve}
                            </Button>
                            <Button
                              type="button"
                              onClick={() =>
                                openReviewDialog(row.transactionId, "rejected")
                              }
                              className="h-7 rounded-md border border-[#ef4444]/25 bg-[#351618] px-3 text-[10px] text-[#ef4444] hover:bg-[#421a1d]"
                            >
                              {text.labels.reject}
                            </Button>
                          </>
                        ) : row.status === "approved" ? (
                          <Button
                            type="button"
                            onClick={() =>
                              markPaidMutation.mutate(row.transactionId)
                            }
                            className="h-7 rounded-md border border-[#22c55e]/25 bg-[#14301f] px-3 text-[10px] text-[#22c55e] hover:bg-[#183925]"
                          >
                            {text.labels.markPaid}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => openNotifyDialog(row.transactionId)}
                            className="h-7 rounded-md border border-white/10 bg-[#2e2e30] px-3 text-[10px] text-white/40 hover:bg-[#353537]"
                          >
                            {text.labels.noted}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-col gap-3 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {text.footer.showing} {showingFrom} {text.footer.to} {showingTo}{" "}
              {text.footer.of} {totalCount} {text.footer.entries}
            </div>
            <Pagination className="mx-0 w-auto justify-end self-end">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage((current) => current - 1);
                    }}
                    className="h-8 rounded-md border border-white/10 px-3 text-xs text-white/45 hover:bg-[#353537] hover:text-white/65"
                  />
                </PaginationItem>
                {visiblePages.map((pageNumber) => {
                  const isActive = pageNumber === page;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNumber);
                        }}
                        isActive={isActive}
                        className={
                          isActive
                            ? "h-8 min-w-8 rounded-md bg-primary px-3 text-xs text-black hover:bg-primary/90"
                            : "h-8 min-w-8 rounded-md border border-white/10 px-3 text-xs text-white/55 hover:bg-[#353537] hover:text-white/75"
                        }
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage((current) => current + 1);
                    }}
                    className="h-8 rounded-md border border-white/10 px-3 text-xs text-white/45 hover:bg-[#353537] hover:text-white/65"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          {isFetching && !isLoading ? (
            <div className="mt-3 text-xs text-white/35">{text.states.loading}</div>
          ) : null}
        </div>
      </div>

      <WithdrawReviewDialog
        open={reviewState.open}
        onOpenChange={(open) => {
          if (!open) {
            closeReviewDialog();
            return;
          }
          setReviewState((prev) => ({ ...prev, open: true }));
        }}
        mode={reviewState.status}
        onConfirm={handleReview}
        isLoading={reviewMutation.isPending}
        isArabic={isArabic}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={(value) => {
          setRejectionReason(value);
          if (rejectionReasonError) setRejectionReasonError("");
        }}
        rejectionReasonError={rejectionReasonError}
      />
      <WithdrawNotifyDialog
        open={notifyState.open}
        onOpenChange={(open) => {
          if (!open) {
            closeNotifyDialog();
            return;
          }
          setNotifyState((prev) => ({ ...prev, open: true }));
        }}
        message={notifyMessage}
        onMessageChange={(value) => {
          setNotifyMessage(value);
          if (notifyError) setNotifyError("");
        }}
        onSubmit={handleNotify}
        isLoading={notifyMutation.isPending}
        isArabic={isArabic}
        error={notifyError}
      />
    </div>
  );
}

