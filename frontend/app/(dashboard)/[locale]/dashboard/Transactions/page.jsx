"use client";

import { useMemo, useState } from "react";
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
import { ArrowDownToLine, ArrowUpFromLine, Cpu, Search } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useTransactionsListQuery } from "@/api/services/admin/transactions/transactions.query";
import { formatLocalizedDate } from "@/lib/format-localized-date";

const tabs = [
  { key: "All", label: "admin_transactions.tabs.all" },
  { key: "Deposit", label: "admin_transactions.tabs.deposit" },
  { key: "Withdraw", label: "admin_transactions.tabs.withdraw" },
  { key: "Mining", label: "admin_transactions.tabs.mining" },
];

const typeMapping = {
  deposit: "Deposit",
  withdraw: "Withdrawal",
  mining_profit: "Mining",
  plan_purchase: "Plan Purchase",
  referral_commission: "Referral Commission",
};

const statusStyles = {
  approved: "bg-primary/15 text-primary",
  paid: "bg-primary/15 text-primary",
  completed: "bg-primary/15 text-primary",
};

const typeStyles = {
  deposit: {
    label: "admin_transactions.types.deposit",
    icon: ArrowDownToLine,
    className: "border border-primary/30 bg-primary/10 text-primary",
  },
  withdraw: {
    label: "admin_transactions.types.withdraw",
    icon: ArrowUpFromLine,
    className: "border border-[#c58a15]/30 bg-[#4b3f15] text-primary",
  },
  mining_profit: {
    label: "admin_transactions.types.mining_profit",
    icon: Cpu,
    className: "border border-[#7c3aed]/30 bg-[#25173a] text-[#a78bfa]",
  },
  plan_purchase: {
    label: "admin_transactions.types.plan_purchase",
    icon: Cpu,
    className: "border border-[#7c3aed]/30 bg-[#25173a] text-[#a78bfa]",
  },
  referral_commission: {
    label: "admin_transactions.types.referral_commission",
    icon: Cpu,
    className: "border border-[#7c3aed]/30 bg-[#25173a] text-[#a78bfa]",
  },
};

export default function AdminTransactionsPage() {
  const { locale, t } = useTranslations();
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Map UI tab to API params
  const apiParams = useMemo(() => {
    const type =
      selectedTab === "All"
        ? "all"
        : selectedTab.toLowerCase() === "mining"
          ? "mining_profit"
          : selectedTab.toLowerCase();

    const status =
      selectedTab === "All"
        ? "all"
        : ["approved", "paid", "completed"].includes(selectedTab.toLowerCase())
          ? selectedTab.toLowerCase()
          : "all";

    const params = {
      type,
      status,
      page,
      limit,
    };

    // Only add search if it has a value
    if (search && search.trim()) {
      params.search = search.trim();
    }

    return params;
  }, [selectedTab, page, search]);

  const {
    data: transactionsResponse,
    isLoading,
    isError,
  } = useTransactionsListQuery(apiParams);

  const transactions = transactionsResponse?.data || [];
  const pagination = transactionsResponse?.pagination;
  const headline = transactionsResponse?.headline;
  const counters = transactionsResponse?.counters;

  const pendingWithdrawalRequests = headline?.pendingWithdrawalRequests || 0;
  const totalPages = pagination?.totalPages || 1;
  const totalEntries = pagination?.total || 0;

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalEntries);

  return (
    <div className="min-h-screen p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold leading-none text-white">
            {t("admin_transactions.title")}
          </h1>
          <p className="mt-2 text-sm text-white/45">
            {t("admin_transactions.pendingWithdrawals", {
              count: pendingWithdrawalRequests,
            })}
          </p>
        </div>

        <div className="rounded-[8px] border border-white/5 bg-[#242426] p-3">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full max-w-[420px]">
              <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 ltr:left-3 rtl:right-3" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin_transactions.searchPlaceholder")}
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
                    onClick={() => setSelectedTab(tab.key)}
                    className={`h-8 rounded-md px-3 text-xs ${
                      isActive
                        ? "bg-primary text-black hover:bg-primary/90"
                        : "border border-white/10 bg-[#2e2e30] text-white/55 hover:bg-[#353537]"
                    }`}
                  >
                    {t(tab.label)}
                  </Button>
                );
              })}
            </div>
          </div>

          <Table className="rounded-[6px] border-0 bg-[#202021]">
            <TableHeader className="bg-[#363638]">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="h-11 px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {t("admin_transactions.columns.txnId")}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {t("admin_transactions.columns.user")}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {t("admin_transactions.columns.type")}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {t("admin_transactions.columns.amount")}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {t("admin_transactions.columns.balanceAfter")}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {t("admin_transactions.columns.status")}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {t("admin_transactions.columns.date")}
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {t("admin_transactions.columns.note")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#202021]">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-sm text-white/45"
                  >
                    {t("admin_transactions.loading")}
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-sm text-red-400"
                  >
                    {t("admin_transactions.error")}
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-sm text-white/45"
                  >
                    {t("admin_transactions.empty")}
                    {process.env.NODE_ENV === "development" && (
                      <div className="mt-2 text-xs text-amber-400 space-y-1">
                        <div>API Params: {JSON.stringify(apiParams)}</div>
                        <div>
                          Response Data:{" "}
                          {JSON.stringify(
                            transactionsResponse?.data?.length || 0,
                          )}{" "}
                          items
                        </div>
                        <div>Is Loading: {isLoading ? "Yes" : "No"}</div>
                        <div>Is Error: {isError ? "Yes" : "No"}</div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction, index) => {
                  const typeMeta =
                    typeStyles[transaction.type] || typeStyles.deposit;
                  const TypeIcon = typeMeta.icon;

                  return (
                    <TableRow
                      key={`${transaction.transactionId}-${index}`}
                      className="h-[50px] border-b border-white/8 hover:bg-white/[0.02]"
                    >
                      <TableCell className="px-4 py-3 text-xs text-white/45">
                        #{transaction.transactionCode}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs font-semibold text-white">
                        {transaction.user?.name || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${typeMeta.className}`}
                        >
                          <TypeIcon className="h-3 w-3" />
                          {t(typeMeta.label)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs font-semibold text-primary">
                        ${transaction.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs font-semibold text-white/65">
                        ${transaction.balanceAfter?.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[transaction.status] || statusStyles.completed}`}
                        >
                          {transaction.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-white/45">
                        {formatLocalizedDate(transaction.date, locale)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-white/45">
                        {transaction.note}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-col gap-3 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {t("admin_transactions.pagination.showing")} {startEntry}{" "}
              {t("admin_transactions.pagination.to")} {endEntry}{" "}
              {t("admin_transactions.pagination.of")} {totalEntries}{" "}
              {t("admin_transactions.pagination.entries")}
            </div>
            <Pagination className="mx-0 w-auto justify-end self-end">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={`h-8 rounded-md border border-white/10 bg-[#2e2e30] px-3 text-xs text-white/45 hover:bg-[#353537] hover:text-white/65 ${
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                        isActive={page === pageNum}
                        className={`h-8 min-w-8 rounded-md px-3 text-xs ${
                          page === pageNum
                            ? "bg-primary text-black hover:bg-primary/90"
                            : "border border-white/10 bg-[#2e2e30] text-white/55 hover:bg-[#353537] hover:text-white/75"
                        }`}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={`h-8 rounded-md border border-white/10 bg-[#2e2e30] px-3 text-xs text-white/45 hover:bg-[#353537] hover:text-white/65 ${
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
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
