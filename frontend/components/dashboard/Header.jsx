"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDashboardSummaryQuery } from "@/api/services/user/Statistics/statistics.query";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useMyNotificationsQuery,
} from "@/api/services/user/notifications/notifications.query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardSidebar from "@/components/dashboard/sidebar";
import { Bell, ArrowUpRight, Menu } from "lucide-react";
import LanguageSwitcher from "../LanguageSwitcher";
import { toast } from "sonner";

export default function DashboardHeader() {
  const { t, locale } = useTranslations();
  const { user } = useAuth();
  const { data: summaryResponse } = useDashboardSummaryQuery();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: notificationsResponse, isLoading: notificationsLoading } =
    useMyNotificationsQuery(
      {},
      {
        enabled: notificationsOpen,
      },
    );
  const { mutate: markRead, isPending: markReadPending } =
    useMarkNotificationAsReadMutation({
      onError: (error) =>
        toast.error(
          error?.response?.data?.message ||
            (isRTL ? "تعذر تحديث الإشعار" : "Failed to update notification"),
        ),
    });
  const { mutate: markAllRead, isPending: markAllReadPending } =
    useMarkAllNotificationsAsReadMutation({
      onSuccess: () =>
        toast.success(
          isRTL ? "تم تحديد جميع الإشعارات كمقروءة" : "All notifications marked as read",
        ),
      onError: (error) =>
        toast.error(
          error?.response?.data?.message ||
            (isRTL ? "تعذر تحديث الإشعارات" : "Failed to update notifications"),
        ),
    });

  const isRTL = locale === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const numberLocale = isRTL ? "ar-EG" : "en-US";

  const summary = summaryResponse?.data || {};
  const totalBalance = Number(summary?.walletBalance || 0);
  const currency = summary?.currency || "USDT";
  const rawBalanceChangePercent =
    summary?.walletChangePercent ?? summary?.balanceChangePercent ?? null;
  const hasBalanceChange =
    rawBalanceChangePercent !== null &&
    rawBalanceChangePercent !== undefined &&
    !Number.isNaN(Number(rawBalanceChangePercent));
  const balanceChangePercent = hasBalanceChange
    ? Number(rawBalanceChangePercent)
    : 0;
  const notifications = Array.isArray(notificationsResponse?.data)
    ? notificationsResponse.data
    : [];
  const unreadCount = notifications.filter((item) => !item?.read).length;

  const displayName = user?.name || (isRTL ? "المستخدم" : "User");
  const displayEmail = user?.email || "--";
  const initials = String(displayName)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const nf = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  return (
    <div dir={dir} className="mb-4 w-full">
      <div className="w-full bg-[#070e1b]/95 border-b border-cyan-500/20 backdrop-blur-xl p-3 px-4 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-[10px] sm:text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                {isRTL ? "الرصيد المتاح" : "AVAILABLE BALANCE"}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                  {nf.format(totalBalance)}{" "}
                  <span className="text-xs font-bold text-cyan-400 font-sans">{currency}</span>
                </div>
                {hasBalanceChange ? (
                  <div
                    className={`hidden items-center text-xs sm:flex font-bold px-2 py-0.5 rounded-full ${
                      balanceChangePercent >= 0
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-red-400 bg-red-500/10 border border-red-500/20"
                    }`}
                  >
                    <ArrowUpRight
                      className={`h-3 w-3 ${
                        balanceChangePercent < 0 ? "rotate-90" : ""
                      }`}
                    />
                    <span>
                      {balanceChangePercent >= 0 ? "+" : ""}
                      {balanceChangePercent.toFixed(2)}%
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl border border-cyan-500/30 bg-[#09152b] hover:bg-cyan-500/20 text-cyan-300 md:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="fixed left-0 top-0 inset-y-0 w-64 translate-x-0 translate-y-0 border-none bg-[var(--color-sidebar)] p-0 sm:rounded-none">
                <DialogHeader className="sr-only">
                  <DialogTitle>{t("sidebar.title")}</DialogTitle>
                </DialogHeader>
                <DashboardSidebar asDrawer />
              </DialogContent>
            </Dialog>

            <div className="hidden items-center gap-2 md:flex">
              <LanguageSwitcher />
            </div>

            <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DialogTrigger asChild>
                <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#09152b] hover:bg-cyan-500/20 text-cyan-300 transition-colors">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-black text-black">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>
              </DialogTrigger>
              <DialogContent
                className={`border-cyan-500/30 bg-[#081223] text-white sm:max-w-lg rounded-2xl shadow-2xl ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <DialogHeader className={isRTL ? "sm:text-right" : "sm:text-left"}>
                  <DialogTitle className="text-white font-bold text-base">
                    {isRTL ? "مركز الإشعارات" : "Notifications"}
                  </DialogTitle>
                  <DialogDescription className="text-cyan-200/60 text-xs">
                    {isRTL ? "آخر إشعارات وعمليات حسابك" : "Your latest account updates"}
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={markAllReadPending || notifications.length === 0}
                      onClick={() => markAllRead()}
                      className="h-8 px-2 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      {isRTL ? "تحديد الكل كمقروء" : "Mark all as read"}
                    </Button>
                  </div>
                  {notificationsLoading ? (
                    <div className="rounded-xl border border-cyan-500/20 bg-[#0b172c] p-3 text-xs text-slate-400">
                      {isRTL ? "جارٍ تحميل الإشعارات..." : "Loading notifications..."}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="rounded-xl border border-cyan-500/20 bg-[#0b172c] p-4 text-xs text-slate-400 text-center">
                      {isRTL ? "لا توجد إشعارات جديدة حالياً." : "No new notifications."}
                    </div>
                  ) : (
                    notifications.map((item, index) => (
                      <div
                        key={item?._id || `${item?.createdAt || "n"}-${index}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (!item?.read && item?._id) markRead(item._id);
                        }}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && !item?.read && item?._id) {
                            e.preventDefault();
                            markRead(item._id);
                          }
                        }}
                        className={`rounded-xl border p-3 transition-colors ${
                          item?.read
                            ? "border-cyan-500/10 bg-[#0b172c]"
                            : "border-cyan-500/40 bg-cyan-500/10"
                        }`}
                      >
                        <div className="text-xs font-bold text-white">
                          {item?.title || (isRTL ? "إشعار جديد" : "New notification")}
                        </div>
                        <div className="mt-1 text-xs text-slate-300">
                          {item?.message || "--"}
                        </div>
                        <div className="mt-2 text-[10px] text-cyan-400/60 font-mono">
                          {item?.createdAt
                            ? new Date(item.createdAt).toLocaleString(
                                isRTL ? "ar-EG" : "en-US",
                              )
                            : "--"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <div className="hidden items-center gap-2 pl-2 rtl:pr-2 md:flex">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 font-black text-black text-xs shadow-md shadow-cyan-500/25">
                {initials || "US"}
              </div>
              <div className="flex flex-col">
                <div className="text-xs font-bold text-white">{displayName}</div>
                <div className="text-[11px] text-cyan-200/60 truncate max-w-[140px]">{displayEmail}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
