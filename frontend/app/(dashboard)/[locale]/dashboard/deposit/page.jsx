"use client";

import { useMemo, useState } from "react";
import { Copy, Search } from "lucide-react";
import { toast } from "sonner";
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
import { useDepositListQuery } from "@/api/services/admin/deposit/deposit.query";

const PAGE_SIZE = 10;

const copy = {
  en: {
    title: "Deposits Monitoring",
    subtitle: (count) => `${count} payment orders`,
    searchPlaceholder: "Search by user, order, tx hash, wallet...",
    tabs: {
      all: "All",
      pending: "Pending",
      paid: "Paid",
      expired: "Expired",
    },
    columns: {
      orderId: "Order ID",
      user: "User",
      expected: "Expected",
      paid: "Paid",
      wallet: "Wallet",
      status: "Status",
      mismatch: "Mismatch",
    },
    labels: {
      none: "None",
      unknownUser: "Unknown User",
      copied: "Wallet copied",
    },
    states: {
      loading: "Loading payment orders...",
      empty: "No payment orders found.",
      error: "Failed to load payment orders.",
    },
    footer: { showing: "SHOWING", to: "TO", of: "OF", entries: "ENTRIES" },
  },
  ar: {
    title: "مراقبة الإيداعات",
    subtitle: (count) => `${count} طلب دفع`,
    searchPlaceholder: "ابحث بالمستخدم أو رقم الطلب أو tx hash أو المحفظة...",
    tabs: {
      all: "الكل",
      pending: "قيد الانتظار",
      paid: "مدفوع",
      expired: "منتهي",
    },
    columns: {
      orderId: "رقم الطلب",
      user: "المستخدم",
      expected: "المبلغ المتوقع",
      paid: "المبلغ المدفوع",
      wallet: "عنوان المحفظة",
      status: "الحالة",
      mismatch: "اختلاف",
    },
    labels: {
      none: "لا يوجد",
      unknownUser: "مستخدم غير معروف",
      copied: "تم نسخ عنوان المحفظة",
    },
    states: {
      loading: "جاري تحميل طلبات الدفع...",
      empty: "لا توجد طلبات دفع.",
      error: "تعذر تحميل طلبات الدفع.",
    },
    footer: { showing: "إظهار", to: "إلى", of: "من", entries: "مدخلات" },
  },
};

const statusStyles = {
  pending: "bg-blue-500/15 text-blue-300",
  paid: "bg-emerald-500/15 text-emerald-300",
  expired: "bg-amber-500/15 text-amber-300",
  confirmed: "bg-emerald-500/15 text-emerald-300",
  completed: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
};

const mismatchStyles = {
  none: "text-white/40",
  underpaid: "text-red-300",
  overpaid: "text-amber-300",
  duplicate_payment: "text-orange-300",
};

function normalizeStatus(value) {
  const status = String(value || "pending").toLowerCase();
  if (status === "confirmed" || status === "completed") return "paid";
  return status;
}

function shortenWallet(address) {
  const value = String(address || "");
  if (!value || value === "--") return "--";
  if (value.length <= 14) return value;
  return `${value.slice(0, 9)}...${value.slice(-4)}`;
}

export default function AdminDepositPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const text = copy[locale] || copy.en;

  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useDepositListQuery(
    {
      status: selectedTab,
      page,
      limit: PAGE_SIZE,
    },
    {
      refetchInterval: 15000,
    },
  );

  const payload = data ?? {};
  const pagination = payload?.pagination || {};
  const counters = payload?.counters || {};
  const serverRows = Array.isArray(payload?.data) ? payload.data : [];
  const currency = counters?.currency || "USD";

  const totalCount = Number(pagination.total ?? serverRows.length) || 0;
  const totalPages =
    Number(pagination.totalPages) || Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const rows = serverRows.map((item) => {
    const orderId = item?.order_id || item?.orderId || item?.transactionId || "--";
    const status = normalizeStatus(item?.status);
    const expectedAmount = Number(
      item?.expected_amount ?? item?.expectedAmount ?? item?.amount ?? 0,
    );
    const paidAmount = Number(item?.paid_amount ?? item?.paidAmount ?? 0);
    const mismatch = String(item?.mismatch_type || item?.mismatchType || "none").toLowerCase();

    return {
      orderId,
      userName: item?.user?.name || text.labels.unknownUser,
      userEmail: item?.user?.email || "",
      expectedAmount,
      paidAmount,
      wallet: item?.address || item?.walletAddress || "--",
      txHash: item?.tx_hash || item?.txHash || "--",
      status,
      mismatch,
      createdAt: formatLocalizedDate(item?.created_at || item?.createdAt || item?.date, locale, {
        includeTime: true,
      }),
    };
  });

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      `${row.orderId} ${row.userName} ${row.userEmail} ${row.wallet} ${row.txHash}`
        .toLowerCase()
        .includes(q),
    );
  }, [rows, search]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 2) return [1, 2, 3];
    if (page >= totalPages - 1) return [totalPages - 2, totalPages - 1, totalPages];
    return [page - 1, page, page + 1];
  }, [page, totalPages]);

  const showingFrom = filteredRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo =
    filteredRows.length === 0
      ? 0
      : Math.min((page - 1) * PAGE_SIZE + filteredRows.length, totalCount);

  const tabs = [
    { key: "all", label: text.tabs.all },
    { key: "pending", label: text.tabs.pending },
    { key: "paid", label: text.tabs.paid },
    { key: "expired", label: text.tabs.expired },
  ];

  return (
    <div className={`min-h-screen p-4 text-white sm:p-6 ${isArabic ? "text-right" : "text-left"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold leading-none text-white">{text.title}</h1>
            <p className="mt-2 text-sm text-white/45">{text.subtitle(totalCount)}</p>
          </div>
          {isFetching && !isLoading ? (
            <div className="text-xs text-white/45">
              {isArabic ? "تحديث تلقائي كل 15 ثانية" : "Auto-refresh every 15s"}
            </div>
          ) : null}
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

          <div className="overflow-x-auto">
            <Table className="min-w-[980px] rounded-[6px] border-0">
              <TableHeader className="bg-[#363638]">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="h-11 px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">{text.columns.orderId}</TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">{text.columns.user}</TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">{text.columns.expected}</TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">{text.columns.paid}</TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">{text.columns.wallet}</TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">{text.columns.status}</TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">{text.columns.mismatch}</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {isLoading ? (
                <TableRow className="border-b border-white/8">
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-sm text-white/45">{text.states.loading}</TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow className="border-b border-white/8">
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-sm text-red-400">{text.states.error}</TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow className="border-b border-white/8">
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-sm text-white/45">{text.states.empty}</TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row, index) => (
                  <TableRow key={`${row.orderId}-${index}`} className="h-[50px] border-b border-white/8 hover:bg-white/[0.02]">
                    <TableCell className="px-4 py-3 text-xs text-sky-300">{row.orderId}</TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold text-white">{row.userName}</TableCell>
                    <TableCell className="px-4 py-3 text-xs text-primary">
                      {new Intl.NumberFormat(isArabic ? "ar" : "en-US", {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 6,
                      }).format(row.expectedAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-white/80">
                      {new Intl.NumberFormat(isArabic ? "ar" : "en-US", {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 6,
                      }).format(row.paidAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-white/45">
                      <div className="flex items-center gap-2">
                        <span>{shortenWallet(row.wallet)}</span>
                        {row.wallet !== "--" ? (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(row.wallet);
                                toast.success(text.labels.copied);
                              } catch {
                                toast.error(text.states.error);
                              }
                            }}
                            className="text-white/45 transition-colors hover:text-white/70"
                            aria-label={`copy-${row.orderId}`}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[row.status] || statusStyles.pending}`}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className={`px-4 py-3 text-xs ${mismatchStyles[row.mismatch] || mismatchStyles.none}`}>
                      {row.mismatch === "none" ? text.labels.none : row.mismatch}
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {text.footer.showing} {showingFrom} {text.footer.to} {showingTo} {text.footer.of} {totalCount} {text.footer.entries}
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
        </div>
      </div>
    </div>
  );
}
