"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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
import { Ban, DollarSign, Eye, LockOpen, Search } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import {
  useAdminUsersQuery,
  useToggleUserBlockMutation,
} from "@/api/services/admin/users-management/users-management.query";
import ShowUserDialog from "./components/show-user-dialog";
import ConfirmUserBlockDialog from "./components/confirm-user-block-dialog";
import WalletAdjustDialog from "./components/wallet-adjust";
import { formatLocalizedDate } from "@/lib/format-localized-date";

const PAGE_SIZE = 10;

const statusStyles = {
  active: "bg-primary/20 text-primary",
  pending: "bg-[#4b3f15] text-primary",
  blocked: "bg-[#3b1718] text-[#ef4444]",
};

const kycStyles = {
  verified: "text-primary",
  approved: "text-primary",
  pending: "text-primary",
  rejected: "text-[#ef4444]",
  not_submitted: "text-white/55",
};

const copy = {
  en: {
    title: "Users Management",
    subtitle: (count) => `${count} total users registered`,
    searchPlaceholder: "Search by name, email, or ID...",
    tabs: {
      all: "All",
      active: "Active",
      pending: "Pending",
      blocked: "Blocked",
    },
    columns: {
      id: "User ID",
      fullName: "Full Name",
      email: "Email",
      balance: "Balance",
      status: "Status",
      kyc: "KYC",
      registered: "Registered",
      actions: "Actions",
    },
    states: {
      loading: "Loading users...",
      empty: "No users found.",
      error: "Failed to load users.",
    },
    footer: {
      showing: "SHOWING",
      to: "TO",
      of: "OF",
      entries: "ENTRIES",
    },
    labels: {
      unknown: "Unknown user",
      noEmail: "No email",
      noBalance: "$0",
      active: "Active",
      pending: "Pending",
      blocked: "Blocked",
      verified: "Verified",
      approved: "Verified",
      submitted: "Pending",
      not_submitted: "Not Submitted",
      rejected: "Rejected",
      unknownKyc: "Unknown",
    },
  },
  ar: {
    title: "إدارة المستخدمين",
    subtitle: (count) => `${count} مستخدمًا مسجلًا`,
    searchPlaceholder: "ابحث بالاسم أو البريد أو المعرف...",
    tabs: {
      all: "الكل",
      active: "نشط",
      pending: "قيد الانتظار",
      blocked: "محظور",
    },
    columns: {
      id: "معرف المستخدم",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      balance: "الرصيد",
      status: "الحالة",
      kyc: "التوثيق",
      registered: "تاريخ التسجيل",
      actions: "الإجراءات",
    },
    states: {
      loading: "جاري تحميل المستخدمين...",
      empty: "لا يوجد مستخدمون.",
      error: "تعذر تحميل المستخدمين.",
    },
    footer: {
      showing: "إظهار",
      to: "إلى",
      of: "من",
      entries: "مدخلات",
    },
    labels: {
      unknown: "مستخدم غير معروف",
      noEmail: "لا يوجد بريد",
      noBalance: "$0",
      active: "نشط",
      pending: "قيد الانتظار",
      blocked: "محظور",
      verified: "موثق",
      approved: "موثق",
      submitted: "قيد المراجعة",
      not_submitted: "غير مرسل",
      rejected: "مرفوض",
      unknownKyc: "غير معروف",
    },
  },
};

function pickUsersCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.users,
    payload.items,
    payload.docs,
    payload.results,
    payload.data,
    payload.list,
    payload.records,
    payload.rows,
    payload.entries,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value;

    if (value && typeof value === "object") {
      const nestedCandidates = [
        value.users,
        value.items,
        value.docs,
        value.results,
        value.data,
        value.list,
        value.records,
        value.rows,
        value.entries,
      ];

      for (const nestedCandidate of nestedCandidates) {
        if (Array.isArray(nestedCandidate)) return nestedCandidate;
      }
    }
  }

  return [];
}

function pickPagination(payload) {
  if (!payload || typeof payload !== "object") return {};

  if (payload.pagination || payload.meta || payload.pageInfo) {
    return payload.pagination || payload.meta || payload.pageInfo;
  }

  if (payload.data && typeof payload.data === "object") {
    return (
      payload.data.pagination ||
      payload.data.meta ||
      payload.data.pageInfo ||
      payload.data.paginationResult ||
      {}
    );
  }

  return (
    payload.paginationResult ||
    {}
  );
}

function buildUserId(user) {
  if (user?.id) return user.id;
  if (user?.slug) return `#${String(user.slug).toUpperCase()}`;
  if (user?._id) return `#USR-${String(user._id).slice(-6).toUpperCase()}`;
  return "#USR-0000";
}

function formatCurrency(value, locale) {
  const amount = Number(value);

  if (Number.isNaN(amount)) return "$0";

  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function normalizeStatus(user) {
  if (user?.active === false) return "blocked";

  const status =
    user?.status ||
    user?.accountStatus ||
    user?.userStatus ||
    (user?.active ? "active" : "pending");

  return String(status).toLowerCase();
}

function normalizeKyc(user) {
  return String(user?.kycStatus || "not_submitted").toLowerCase();
}

export default function AdminUsersPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const text = copy[locale] || copy.en;
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isShowDialogOpen, setIsShowDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [pendingBlockUser, setPendingBlockUser] = useState(null);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [walletTargetUserId, setWalletTargetUserId] = useState(null);

  const { data, isLoading, isError, isFetching } = useAdminUsersQuery({
    status: selectedTab,
    page,
    limit: PAGE_SIZE,
  });
  const { mutate: toggleUserBlock, isPending: isToggleBlockPending } =
    useToggleUserBlockMutation({
      onSuccess: (_, variables) => {
        toast.success(
          variables.blocked
            ? isArabic
              ? "تم إزالة حظر المستخدم بنجاح."
              : "User unblocked successfully."
            : isArabic
              ? "تم حظر المستخدم بنجاح."
              : "User blocked successfully.",
        );
      },
      onError: () => {
        toast.error(
          isArabic
            ? "تعذر تحديث حالة المستخدم."
            : "Failed to update user status.",
        );
      },
    });

  const tabs = [
    { key: "all", label: text.tabs.all },
    { key: "active", label: text.tabs.active },
    { key: "pending", label: text.tabs.pending },
    { key: "blocked", label: text.tabs.blocked },
  ];

  const rawPayload = data;
  const serverUsers = pickUsersCollection(rawPayload);
  const pagination = pickPagination(rawPayload);
  const totalCount =
    Number(
      pagination.totalItems ??
        pagination.total ??
        pagination.totalUsers ??
        pagination.totalCount ??
        pagination.count ??
        rawPayload?.total ??
        rawPayload?.totalUsers ??
        rawPayload?.totalCount ??
        rawPayload?.results,
    ) || serverUsers.length;
  const totalPages =
    Number(pagination.totalPages ?? pagination.pages) ||
    Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const visiblePages =
    totalPages <= 6
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : page <= 4
        ? [1, 2, 3, 4, 5, 6, "end-ellipsis"]
        : page >= totalPages - 3
          ? [
              "start-ellipsis",
              totalPages - 5,
              totalPages - 4,
              totalPages - 3,
              totalPages - 2,
              totalPages - 1,
              totalPages,
            ]
          : [
              "start-ellipsis",
              page - 2,
              page - 1,
              page,
              page + 1,
              page + 2,
              page + 3,
              "end-ellipsis",
            ];

  const rows = serverUsers.map((user) => {
    const statusType = normalizeStatus(user);
    const kycType = normalizeKyc(user);

    return {
      rawUserId: user?.id || user?._id || null,
      id: buildUserId(user),
      fullName: user?.name || user?.fullName || text.labels.unknown,
      email: user?.email || text.labels.noEmail,
      balance: formatCurrency(
        user?.balance ?? user?.walletBalance ?? 0,
        locale,
      ),
      registered: formatLocalizedDate(
        user?.registeredAt || user?.createdAt || user?.updatedAt,
        locale,
      ),
      statusType,
      kycType,
      statusLabel: text.labels[statusType] || statusType,
      kycLabel: text.labels[kycType] || text.labels.unknownKyc,
    };
  });

  const normalizedSearch = search.trim().toLowerCase();
  const filteredRows = !normalizedSearch
    ? rows
    : rows.filter((user) =>
        `${user.fullName} ${user.email} ${user.id}`
          .toLowerCase()
          .includes(normalizedSearch),
      );

  const showingFrom =
    filteredRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo =
    filteredRows.length === 0
      ? 0
      : Math.min((page - 1) * PAGE_SIZE + filteredRows.length, totalCount);

  const handleConfirmToggleBlock = () => {
    if (!pendingBlockUser?.userId || isToggleBlockPending) return;

    const wasBlocked = pendingBlockUser.blocked;
    toggleUserBlock(
      {
        userId: pendingBlockUser.userId,
        blocked: wasBlocked,
      },
      {
        onSuccess: () => {
          toast.success(
            wasBlocked
              ? (isArabic ? "تم إلغاء حظر المستخدم بنجاح" : "User unblocked successfully")
              : (isArabic ? "تم حظر المستخدم بنجاح" : "User blocked successfully")
          );
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message ||
              (isArabic ? "فشلت العملية" : "Action failed")
          );
        },
        onSettled: () => {
          setIsBlockDialogOpen(false);
          setPendingBlockUser(null);
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
          <h1 className="text-2xl font-bold leading-none text-white">
            {text.title}
          </h1>
          <p className="mt-2 text-sm text-white/45">
            {text.subtitle(totalCount)}
          </p>
        </div>

        <div className="rounded-[8px] border border-white/5 bg-[#242426] p-3 shadow-none">
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

          <Table className=" bg-sidebar">
            <TableHeader className="bg-sidebar">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead >
                  {text.columns.id}
                </TableHead>
                <TableHead >
                  {text.columns.fullName}
                </TableHead>
                <TableHead >
                  {text.columns.email}
                </TableHead>
                <TableHead className=" ">
                  {text.columns.balance}
                </TableHead>
                <TableHead >
                  {text.columns.status}
                </TableHead>
                <TableHead >
                  {text.columns.kyc}
                </TableHead>
                <TableHead >
                  {text.columns.registered}
                </TableHead>
                <TableHead  >
                  {text.columns.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-sidebar">
              {isLoading ? (
                <TableRow className="border-b border-white/8">
                  <TableCell
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-white/45"
                  >
                    {text.states.loading}
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow className="border-b border-white/8">
                  <TableCell
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-[#ef4444]"
                  >
                    {text.states.error}
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow className="border-b border-white/8">
                  <TableCell
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-white/45"
                  >
                    {text.states.empty}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((user) => (
                  <TableRow
                    key={user.id}
                    className="h-[50px] border-b border-white/8 hover:bg-white/[0.02]"
                  >
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold text-white">
                      {user.fullName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-white/45">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold text-primary">
                      {user.balance}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[user.statusType] || statusStyles.pending}`}
                      >
                        {user.statusLabel}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`px-4 py-3 text-xs font-semibold ${kycStyles[user.kycType] || "text-white/55"}`}
                    >
                      {user.kycLabel}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-white/45">
                      {user.registered}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          className="cursor-pointer text-[#3b82f6] transition-all duration-200 hover:scale-110 hover:text-[#60a5fa]"
                          aria-label={`view-${user.id}`}
                          onClick={() => {
                            if (!user.rawUserId) return;
                            setSelectedUserId(user.rawUserId);
                            setIsShowDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          type="button"
                          className="cursor-pointer text-primary transition-all duration-200 hover:scale-110 hover:text-primary/80"
                          aria-label={`wallet-${user.id}`}
                          onClick={() => {
                            if (!user.rawUserId) return;
                            setWalletTargetUserId(user.rawUserId);
                            setIsWalletDialogOpen(true);
                          }}
                        >
                          <DollarSign className="h-4.5 w-4.5" />
                        </button>
                        <button
                          type="button"
                          disabled={!user.rawUserId || isToggleBlockPending}
                          className={
                            user.statusType === "blocked"
                              ? "cursor-pointer text-primary transition-all duration-200 hover:scale-110 hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
                              : "cursor-pointer text-[#ef4444] transition-all duration-200 hover:scale-110 hover:text-[#f87171] disabled:cursor-not-allowed disabled:opacity-40"
                          }
                          aria-label={`block-${user.id}`}
                          onClick={() => {
                            if (!user.rawUserId || isToggleBlockPending) return;
                            setPendingBlockUser({
                              userId: user.rawUserId,
                              blocked: user.statusType === "blocked",
                            });
                            setIsBlockDialogOpen(true);
                          }}
                        >
                          {user.statusType === "blocked" ? (
                            <LockOpen className="h-4.5 w-4.5" />
                          ) : (
                            <Ban className="h-4.5 w-4.5" />
                          )}
                        </button>
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
                    className="h-8 rounded-md border border-white/10 bg-[#2e2e30] px-3 text-xs text-white/45 hover:bg-[#353537] hover:text-white/65"
                  />
                </PaginationItem>

                {visiblePages.map((pageNumber) => {
                  if (typeof pageNumber === "string") {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis className="h-8 w-8 text-white/45" />
                      </PaginationItem>
                    );
                  }

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
                            : "h-8 min-w-8 rounded-md border border-white/10 bg-[#2e2e30] px-3 text-xs text-white/55 hover:bg-[#353537] hover:text-white/75"
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
                    className="h-8 rounded-md border border-white/10 bg-[#2e2e30] px-3 text-xs text-white/45 hover:bg-[#353537] hover:text-white/65"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          {isFetching && !isLoading ? (
            <div className="mt-3 text-xs text-white/35">
              {text.states.loading}
            </div>
          ) : null}
        </div>
      </div>

      <ShowUserDialog
        userId={selectedUserId}
        open={isShowDialogOpen}
        onOpenChange={(open) => {
          setIsShowDialogOpen(open);
          if (!open) {
            setSelectedUserId(null);
          }
        }}
      />
      <ConfirmUserBlockDialog
        open={isBlockDialogOpen}
        onOpenChange={(open) => {
          setIsBlockDialogOpen(open);
          if (!open) {
            setPendingBlockUser(null);
          }
        }}
        onConfirm={handleConfirmToggleBlock}
        isBlocked={Boolean(pendingBlockUser?.blocked)}
        isLoading={isToggleBlockPending}
        isArabic={isArabic}
      />
      <WalletAdjustDialog
        open={isWalletDialogOpen}
        userId={walletTargetUserId}
        onOpenChange={(open) => {
          setIsWalletDialogOpen(open);
          if (!open) {
            setWalletTargetUserId(null);
          }
        }}
      />
    </div>
  );
}
