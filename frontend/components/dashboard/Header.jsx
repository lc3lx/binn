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
    <div dir={dir} className="mb-6 w-full">
      <div className="w-full bg-sidebar p-3 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-[11px] text-white/70 md:text-xs">
                {isRTL ? "الرصيد الحالي" : "CURRENT BALANCE"}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-white md:text-2xl">
                  {nf.format(totalBalance)}{" "}
                  <span className="text-sm text-white/70">{currency}</span>
                </div>
                {hasBalanceChange ? (
                  <div
                    className={`hidden items-center text-xs sm:flex ${
                      balanceChangePercent >= 0 ? "text-green-500" : "text-red-400"
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
                  className="rounded-xl border border-gray-600/40 bg-[#0b0e11] hover:bg-white/10 md:hidden"
                >
                  <Menu className="h-4 w-4 text-white" />
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
                <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-600/40 bg-[#0b0e11] hover:bg-white/10">
                  <Bell className="h-4 w-4 text-white" />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-black">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>
              </DialogTrigger>
              <DialogContent
                className={`border-white/10 bg-[#202123] text-white sm:max-w-lg ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <DialogHeader className={isRTL ? "sm:text-right" : "sm:text-left"}>
                  <DialogTitle>
                    {isRTL ? "الإشعارات" : "Notifications"}
                  </DialogTitle>
                  <DialogDescription className="text-white/45">
                    {isRTL ? "آخر إشعارات حسابك" : "Your latest account notifications"}
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
                      className="h-8 px-2 text-xs text-primary hover:text-primary/80"
                    >
                      {isRTL ? "تحديد الكل كمقروء" : "Mark all as read"}
                    </Button>
                  </div>
                  {notificationsLoading ? (
                    <div className="rounded-md border border-white/10 bg-[#2a2b2d] p-3 text-sm text-white/70">
                      {isRTL ? "جارٍ تحميل الإشعارات..." : "Loading notifications..."}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="rounded-md border border-white/10 bg-[#2a2b2d] p-3 text-sm text-white/60">
                      {isRTL ? "لا توجد إشعارات حالياً." : "No notifications yet."}
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
                        className={`rounded-md border p-3 transition-colors ${
                          item?.read
                            ? "border-white/10 bg-[#2a2b2d]"
                            : "border-primary/30 bg-primary/5"
                        }`}
                      >
                        <div className="text-sm font-semibold text-white">
                          {item?.title || (isRTL ? "إشعار جديد" : "New notification")}
                        </div>
                        <div className="mt-1 text-sm text-white/70">
                          {item?.message || "--"}
                        </div>
                        <div className="mt-2 text-xs text-white/40">
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
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary font-bold text-black">
                {initials || "US"}
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-semibold text-white">{displayName}</div>
                <div className="text-xs text-white/60">{displayEmail}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
