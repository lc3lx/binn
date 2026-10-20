"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { usetransactionsListQuery } from "@/api/services/user/Transactions/transactions.query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Search, ArrowDownCircle, ArrowUpCircle, Coins } from "lucide-react";
import SupportButton from "@/components/site/SupportButton";

const statusToneMap = {
  completed: "bg-green-500/15 text-green-400 border border-green-600/30",
  confirmed: "bg-green-500/15 text-green-400 border border-green-600/30",
  approved: "bg-green-500/15 text-green-400 border border-green-600/30",
  pending: "bg-yellow-500/15 text-yellow-300 border border-yellow-600/30",
  rejected: "bg-red-500/15 text-red-400 border border-red-600/30",
  failed: "bg-red-500/15 text-red-400 border border-red-600/30",
};

function normalizeType(type) {
  if (type === "plan_purchase") return "plan";
  return type || "deposit";
}

function getTypeLabel(type, t, locale) {
  if (type === "plan") return t("transactions.types.plan");
  if (type === "deposit") return t("transactions.types.deposit");
  if (type === "withdraw") return t("transactions.types.withdraw");
  return locale === "ar" ? "المعاملات" : "Transaction";
}

function getStatusLabel(status, t) {
  if (status === "completed") return t("transactions.status.completed");
  if (status === "pending") return t("transactions.status.pending");
  if (status === "failed") return t("transactions.status.failed");
  if (status === "confirmed") return t("transactions.status.confirmed");
  if (status === "approved") return t("transactions.status.approved");
  if (status === "rejected") return t("transactions.status.rejected");
  return status || "-";
}

function TypeIcon({ type }) {
  const wrapBase =
    "inline-flex items-center justify-center w-7 h-7 rounded-full border transition-transform duration-200 ease-out hover:scale-105 group-hover:scale-105";
  const tone =
    type === "deposit"
      ? "bg-green-500/15 text-green-400 border-green-600/30"
      : type === "withdraw"
        ? "bg-red-500/15 text-red-400 border-red-600/30"
        : "bg-yellow-500/15 text-yellow-300 border-yellow-600/30";
  const Icon =
    type === "deposit"
      ? ArrowDownCircle
      : type === "withdraw"
        ? ArrowUpCircle
        : Coins;

  return (
    <span className={`${wrapBase} ${tone}`}>
      <Icon className="w-4 h-4" />
    </span>
  );
}

export default function TransactionsPage() {
  const { t, locale } = useTranslations();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const {
    data: transactionsResponse,
    isLoading,
    isError,
  } = usetransactionsListQuery();

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const rows = useMemo(() => {
    const raw = Array.isArray(transactionsResponse?.data)
      ? transactionsResponse.data
      : [];

    return raw.map((item) => ({
      id: item?._id || "-",
      type: normalizeType(item?.type),
      rawType: item?.type || "",
      amount: Number(item?.amount || 0),
      currency: item?.currency || "USD",
      status: String(item?.status || "pending").toLowerCase(),
      date: item?.createdAt || null,
      note: item?.note || "",
    }));
  }, [transactionsResponse]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) =>
      [r.id, r.rawType, r.status, r.note].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [rows, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageRows = filtered.slice(start, end);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 ">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t("transactions.title")}
              </h1>
              <p className="text-white/70 text-xs sm:text-sm mt-1">
                {t("transactions.subtitle")}
              </p>
            </div>

            <div className="relative w-full pt-4 sm:pt-0 sm:max-w-xs">
              <Search className="w-4 h-4 text-white/80 absolute left-2 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-7 bg-background text-white border border-gray-400/40"
                placeholder={t("transactions.searchPlaceholder")}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-white/10 bg-card p-6 text-sm text-white/70">
            {locale === "ar" ? "جاري التحميل" : "Loading transactions..."}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
            {locale === "ar"
              ? "يتعذر الحصول على نتائج"
              : "Failed to load transactions"}
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <Table className="text-white min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white/70">
                      {t("transactions.columns.id")}
                    </TableHead>
                    <TableHead className="text-white/70">
                      {t("transactions.columns.type")}
                    </TableHead>
                    <TableHead className="text-white/70">
                      {t("transactions.columns.amount")}
                    </TableHead>
                    <TableHead className="text-white/70">
                      {t("transactions.columns.date")}
                    </TableHead>
                    <TableHead className="text-white/70">
                      {t("transactions.columns.status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-center">
                  {pageRows.map((r, i) => (
                    <TableRow key={`${r.id}-${r.date}-${i}`} className="group">
                      <TableCell className="font-mono text-xs sm:text-sm">
                        {r.id}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <TypeIcon type={r.type} />
                          {getTypeLabel(r.type, t, locale)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <span
                          className={
                            r.type === "withdraw"
                              ? "text-red-400"
                              : "text-green-400"
                          }
                        >
                          {r.type === "withdraw" ? "-" : "+"}
                          {nf.format(r.amount)}
                        </span>{" "}
                        <span className="text-primary">{r.currency}</span>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {r.date ? (
                          <>
                            {new Date(r.date).toLocaleDateString(locale)}{" "}
                            {new Date(r.date).toLocaleTimeString(locale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            statusToneMap[r.status] ||
                            "bg-white/10 text-white/80 border border-white/20"
                          }`}
                        >
                          {getStatusLabel(r.status, t)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="sm:hidden space-y-3">
              {pageRows.map((r, i) => (
                <Card
                  key={`${r.id}-${r.date}-m-${i}`}
                  className="bg-card border border-gray-600/40"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon type={r.type} />
                        <span className="font-mono text-xs">{r.id}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          statusToneMap[r.status] ||
                          "bg-white/10 text-white/80 border border-white/20"
                        }`}
                      >
                        {getStatusLabel(r.status, t)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-xs">
                        {getTypeLabel(r.type, t, locale)}{" "}
                        {r.date ? (
                          <>
                             {new Date(r.date).toLocaleDateString(locale)}{" "}
                            {new Date(r.date).toLocaleTimeString(locale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        ) : null}
                      </div>
                      <div className="text-xs">
                        <span
                          className={
                            r.type === "withdraw"
                              ? "text-red-400"
                              : "text-green-400"
                          }
                        >
                          {r.type === "withdraw" ? "-" : "+"}
                          {nf.format(r.amount)}
                        </span>{" "}
                        <span className="text-primary">{r.currency}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-3 flex bg-card p-2 rounded-2xl text-white gap-3 flex-row items-center justify-between">
              <div className="text-white/70 text-xs sm:text-sm">
                {t("transactions.footer.showing")} {total === 0 ? 0 : start + 1}{" "}
                {t("transactions.footer.to")} {end}{" "}
                {t("transactions.footer.of")} {total}{" "}
                {t("transactions.footer.entries")}
              </div>
            </div>
          </>
        )}
      </div>

      <SupportButton className="fixed bottom-18 ltr:right-6 rtl:left-6 z-50" />
    </div>
  );
}
