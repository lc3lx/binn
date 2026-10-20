"use client";

import { useState } from "react";
import Image from "next/image";
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
  CalendarDays,
  CircleX,
  Eye,
  KeyRound,
  UserRoundCheck,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAdminKycRequestsQuery } from "@/api/services/admin/kyc/kyc.query";
import { formatLocalizedDate } from "@/lib/format-localized-date";
import { IMAGEURL } from "@/api/config";
import ShowKycDialog from "./components/show-dialog";
import EditUserStatue from "./components/Edit-user-statue";

const PAGE_SIZE = 10;

const copy = {
  en: {
    title: "KYC Verification",
    subtitle: (count) => `${count} KYC requests`,
    tabs: {
      all: "All",
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected",
    },
    loading: "Loading KYC requests...",
    error: "Failed to load KYC requests.",
    empty: "No KYC requests found.",
    actions: {
      view: "View Doc",
      approve: "Approve",
      reject: "Reject",
    },
  },
  ar: {
    title: "توثيق الحسابات",
    subtitle: (count) => `${count} طلب توثيق`,
    tabs: {
      all: "الكل",
      approved: "مقبول",
      pending: "قيد الانتظار",
      rejected: "مرفوض",
    },
    loading: "جارٍ تحميل طلبات التوثيق...",
    error: "تعذر تحميل طلبات التوثيق.",
    empty: "لا توجد طلبات توثيق.",
    actions: {
      view: "عرض المستند",
      approve: "قبول",
      reject: "رفض",
    },
  },
};

const statusClasses = {
  pending: "border border-primary/40 bg-primary/10 text-primary",
  approved: "border border-primary/40 bg-primary/15 text-primary",
  rejected: "border border-[#ef4444]/40 bg-[#3a1618] text-[#ef4444]",
  blocked: "border border-[#ef4444]/40 bg-[#3a1618] text-[#ef4444]",
};

function pickRequestsCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.data,
    payload.items,
    payload.results,
    payload.requests,
    payload.list,
    payload.rows,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function pickPagination(payload) {
  if (!payload || typeof payload !== "object") return {};
  return payload.pagination || payload.meta || payload.pageInfo || {};
}

function getInitials(name) {
  if (!name) return "U";
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function normalizeStatus(value) {
  const status = String(value || "pending").toLowerCase();
  if (status === "verified") return "approved";
  if (status === "submitted") return "pending";
  if (status === "blocked") return "blocked";
  return status;
}

function getImageUrl(fileName) {
  if (!fileName) return null;
  if (String(fileName).startsWith("http")) return fileName;
  const base = IMAGEURL?.replace(/\/$/, "") || "";
  const suffix = String(fileName).startsWith("/")
    ? String(fileName)
    : `/${String(fileName)}`;
  return `${base}${suffix}`;
}

export default function AdminKycPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const text = copy[locale] || copy.en;

  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedReviewUserId, setSelectedReviewUserId] = useState(null);
  const [selectedReviewStatus, setSelectedReviewStatus] = useState("pending");
  const [initialReviewDecision, setInitialReviewDecision] =
    useState("approved");
  const [selectedDocs, setSelectedDocs] = useState({
    frontImage: null,
    backImage: null,
    fullName: null,
    email: null,
    userId: null,
    userCode: null,
    kycStatus: null,
    accountStatus: null,
    nationalNumber: null,
    submittedAt: null,
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  });

  const { data, isLoading, isError, isFetching } = useAdminKycRequestsQuery({
    status: selectedTab,
    page,
    limit: PAGE_SIZE,
  });

  const tabs = [
    { key: "all", label: text.tabs.all },
    { key: "approved", label: text.tabs.approved },
    { key: "pending", label: text.tabs.pending },
    { key: "rejected", label: text.tabs.rejected },
  ];

  const rawPayload = data?.data ?? data;
  const requests = pickRequestsCollection(rawPayload);
  const pagination = pickPagination(rawPayload);
  const totalCount =
    Number(
      pagination.total ??
        pagination.totalItems ??
        pagination.totalCount ??
        rawPayload?.total ??
        rawPayload?.results,
    ) || requests.length;
  const totalPages =
    Number(pagination.totalPages ?? pagination.pages) ||
    Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const visiblePages =
    totalPages <= 3
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : page <= 2
        ? [1, 2, 3]
        : page >= totalPages - 1
          ? [totalPages - 2, totalPages - 1, totalPages]
          : [page - 1, page, page + 1];

  const rows = requests.map((item) => {
    const accountStatus = String(
      item?.accountStatus || item?.user?.accountStatus || "",
    ).toLowerCase();
    const fullName =
      item?.fullName || item?.name || item?.user?.name || "Unknown";
    const status = normalizeStatus(
      accountStatus === "blocked"
        ? "blocked"
        : item?.status || item?.kycStatus || item?.user?.kycStatus,
    );
    const submittedAt =
      item?.submittedAt ||
      item?.kycDocuments?.submittedAt ||
      item?.createdAt ||
      item?.updatedAt;
    const frontImageRaw =
      item?.kycDocuments?.frontImage ||
      item?.frontImage ||
      item?.documents?.frontImage ||
      item?.user?.kycDocuments?.frontImage;
    const backImageRaw =
      item?.kycDocuments?.backImage ||
      item?.backImage ||
      item?.documents?.backImage ||
      item?.user?.kycDocuments?.backImage;

    return {
      id: item?.id || item?._id || item?.userId || "",
      userId:
        item?.userId ||
        item?.user?.id ||
        item?.user?._id ||
        item?.id ||
        item?._id ||
        null,
      fullName,
      email: item?.email || item?.user?.email || "--",
      requestId:
        item?.requestId ||
        item?.userCode ||
        item?.user?.userCode ||
      item?.id ||
      item?._id ||
      "--",
      userCode: item?.userCode || item?.user?.userCode || "--",
      accountStatus: accountStatus || "active",
      nationalNumber:
        item?.nationalNumber || item?.kycDocuments?.nationalNumber || "--",
      reviewedAt: formatLocalizedDate(item?.reviewedAt, locale, {
        includeTime: true,
      }),
      reviewedBy: item?.reviewedBy || "--",
      rejectionReason: item?.rejectionReason || null,
      submittedAt: formatLocalizedDate(submittedAt, locale, {
        includeTime: true,
      }),
      status,
      frontImage: getImageUrl(frontImageRaw),
      backImage: getImageUrl(backImageRaw),
    };
  });

  return (
    <div
      className={`min-h-screen p-4 text-white sm:p-6 ${
        isArabic ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-none text-white">
              {text.title}
            </h1>
            <p className="mt-2 text-sm text-white/45">
              {text.subtitle(totalCount)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const active = selectedTab === tab.key;
              return (
                <Button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setSelectedTab(tab.key);
                    setPage(1);
                  }}
                  className={`h-8 rounded-md px-3 text-xs ${
                    active
                      ? "bg-primary text-black hover:bg-primary/90"
                      : "border border-white/10 bg-[#2d2d2f] text-white/55 hover:bg-[#353537]"
                  }`}
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-[12px] border border-white/5 bg-sidebar p-6 text-center text-sm text-white/55">
            {text.loading}
          </div>
        ) : isError ? (
          <div className="rounded-[12px] border border-[#ef4444]/30 bg-[#351618] p-6 text-center text-sm text-[#ef9a9a]">
            {text.error}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-[12px] border border-white/5 bg-sidebar p-6 text-center text-sm text-white/55">
            {text.empty}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {rows.map((request) => {
                const showActions = request.status !== "approved";

                return (
                  <div
                    key={request.id || request.requestId}
                    className="overflow-hidden rounded-[12px] border border-white/5 bg-sidebar shadow-none"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-black">
                            {getInitials(request.fullName)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {request.fullName}
                            </div>
                            <div className="text-xs text-white/35">
                              {request.email}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-medium ${
                            statusClasses[request.status] ||
                            statusClasses.pending
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-white/35">
                        <div className="flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-primary/80" />
                          <span>{request.requestId}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-primary/80" />
                          <span>{request.userCode}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-primary/80" />
                          <span>{request.submittedAt}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/55">
                            {isArabic ? "حالة الحساب:" : "Account Status:"}
                          </span>
                          <span className="capitalize text-white/80">
                            {request.accountStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="overflow-hidden rounded-md border border-white/10 bg-[#19191a] transition-colors hover:border-primary/40"
                          onClick={() => {
                            setSelectedDocs({
                              frontImage: request.frontImage,
                              backImage: request.backImage,
                              fullName: request.fullName,
                              email: request.email,
                              userId: request.userId,
                              userCode: request.userCode,
                              kycStatus: request.status,
                              accountStatus: request.accountStatus,
                              nationalNumber: request.nationalNumber,
                              submittedAt: request.submittedAt,
                              reviewedAt: request.reviewedAt,
                              reviewedBy: request.reviewedBy,
                              rejectionReason: request.rejectionReason,
                            });
                            setIsDocDialogOpen(true);
                          }}
                        >
                          {request.frontImage ? (
                            <Image
                              src={request.frontImage}
                              alt="KYC front document"
                              width={320}
                              height={200}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-[11px] text-white/45">
                              --
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          className="overflow-hidden rounded-md border border-white/10 bg-[#19191a] transition-colors hover:border-primary/40"
                          onClick={() => {
                            setSelectedDocs({
                              frontImage: request.frontImage,
                              backImage: request.backImage,
                              fullName: request.fullName,
                              email: request.email,
                              userId: request.userId,
                              userCode: request.userCode,
                              kycStatus: request.status,
                              accountStatus: request.accountStatus,
                              nationalNumber: request.nationalNumber,
                              submittedAt: request.submittedAt,
                              reviewedAt: request.reviewedAt,
                              reviewedBy: request.reviewedBy,
                              rejectionReason: request.rejectionReason,
                            });
                            setIsDocDialogOpen(true);
                          }}
                        >
                          {request.backImage ? (
                            <Image
                              src={request.backImage}
                              alt="KYC back document"
                              width={320}
                              height={200}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="grid h-[90px] place-items-center text-[11px] text-white/45">
                              --
                            </div>
                          )}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedDocs({
                              frontImage: request.frontImage,
                              backImage: request.backImage,
                              fullName: request.fullName,
                              email: request.email,
                              userId: request.userId,
                              userCode: request.userCode,
                              kycStatus: request.status,
                              accountStatus: request.accountStatus,
                              nationalNumber: request.nationalNumber,
                              submittedAt: request.submittedAt,
                              reviewedAt: request.reviewedAt,
                              reviewedBy: request.reviewedBy,
                              rejectionReason: request.rejectionReason,
                            });
                            setIsDocDialogOpen(true);
                          }}
                          className="h-9 rounded-md border border-white/10 bg-[#2e2e30] text-xs text-white/45 hover:bg-[#353537]"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          {text.actions.view}
                        </Button>

                        {showActions ? (
                          <>
                            <Button
                              type="button"
                              onClick={() => {
                                if (!request.userId && !request.id) return;
                                setSelectedReviewUserId(
                                  request.userId || request.id,
                                );
                                setSelectedReviewStatus(request.status);
                                setInitialReviewDecision("approved");
                                setIsReviewDialogOpen(true);
                              }}
                              className="h-9 rounded-md border border-primary/30 bg-primary/10 text-xs text-primary hover:bg-primary/15"
                            >
                              <UserRoundCheck className="mr-1 h-3.5 w-3.5" />
                              {text.actions.approve}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                if (!request.userId && !request.id) return;
                                setSelectedReviewUserId(
                                  request.userId || request.id,
                                );
                                setSelectedReviewStatus(request.status);
                                setInitialReviewDecision("rejected");
                                setIsReviewDialogOpen(true);
                              }}
                              className="h-9 rounded-md border border-[#ef4444]/30 bg-[#351618] text-xs text-[#ef4444] hover:bg-[#421a1d]"
                            >
                              <CircleX className="mr-1 h-3.5 w-3.5" />
                              {text.actions.reject}
                            </Button>
                          </>
                        ) : (
                          <div className="sm:col-span-2" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
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
                        if (page < totalPages)
                          setPage((current) => current + 1);
                      }}
                      className="h-8 rounded-md border border-white/10 bg-[#2e2e30] px-3 text-xs text-white/45 hover:bg-[#353537] hover:text-white/65"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>

            {isFetching ? (
              <div className="mt-3 text-xs text-white/35">{text.loading}</div>
            ) : null}
          </>
        )}
      </div>

      <ShowKycDialog
        open={isDocDialogOpen}
        onOpenChange={(open) => {
            setIsDocDialogOpen(open);
            if (!open) {
            setSelectedDocs({
              frontImage: null,
              backImage: null,
              fullName: null,
              email: null,
              userId: null,
              userCode: null,
              kycStatus: null,
              accountStatus: null,
              nationalNumber: null,
              submittedAt: null,
              reviewedAt: null,
              reviewedBy: null,
              rejectionReason: null,
            });
          }
        }}
        locale={locale}
        frontImage={selectedDocs.frontImage}
        backImage={selectedDocs.backImage}
        fullName={selectedDocs.fullName}
        email={selectedDocs.email}
        userId={selectedDocs.userId}
        userCode={selectedDocs.userCode}
        kycStatus={selectedDocs.kycStatus}
        accountStatus={selectedDocs.accountStatus}
        nationalNumber={selectedDocs.nationalNumber}
        submittedAt={selectedDocs.submittedAt}
        reviewedAt={selectedDocs.reviewedAt}
        reviewedBy={selectedDocs.reviewedBy}
        rejectionReason={selectedDocs.rejectionReason}
      />

      <EditUserStatue
        key={`${selectedReviewUserId || "none"}-${selectedReviewStatus}-${initialReviewDecision}-${isReviewDialogOpen ? "open" : "closed"}`}
        userId={selectedReviewUserId}
        currentKycStatus={selectedReviewStatus}
        initialDecision={initialReviewDecision}
        open={isReviewDialogOpen}
        onOpenChange={(open) => {
          setIsReviewDialogOpen(open);
          if (!open) {
            setSelectedReviewUserId(null);
            setSelectedReviewStatus("pending");
            setInitialReviewDecision("approved");
          }
        }}
      />
    </div>
  );
}
