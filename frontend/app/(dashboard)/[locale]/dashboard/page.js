"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePathname } from "next/navigation";
import { User, Headphones, Clock3, DollarSign, ArrowUpRight, Zap, Shield } from "lucide-react";
import {
  useDepositsWithdrawalsChartQuery,
  useRecentTransactionsQuery,
  useStatisticsListQuery,
  useUserGrowthChartQuery,
} from "@/api/services/admin/statistics/statistics.query";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-sidebar px-3 py-2 text-xs text-white shadow-xl">
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.name}:</span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const pathname = usePathname();
  const isArabic = pathname?.startsWith("/ar");
  const numberLocale = isArabic ? "ar-EG" : "en-US";
  const text = isArabic
    ? {
        loading: "جاري التحميل...",
        title: "نظرة عامة على لوحة التحكم",
        subtitle: "مرحبًا بعودتك، المدير العام. إليك ملخص اليوم.",
        vsLastMonth: "مقارنة بالشهر الماضي",
        cards: {
          totalUsers: "إجمالي المستخدمين",
          totalDeposits: "إجمالي الإيداعات",
          totalWithdrawals: "إجمالي السحوبات",
          activeMiningPlans: "سكوترات RIDE النشطة",
          pendingKyc: "طلبات التوثيق المعلقة",
          pendingWithdrawals: "السحوبات المعلقة",
          openSupportTickets: "تذاكر الدعم المفتوحة",
        },
        charts: {
          depositsVsWithdrawals: "الإيداعات مقابل السحوبات",
          monthlyVolume: "حجم العمليات الشهري",
          deposits: "إيداعات",
          withdrawals: "سحوبات",
          userGrowth: "نمو المستخدمين",
          cumulativeUsers: "المستخدمون المسجلون تراكميًا",
          users: "مستخدمون",
          recentTransactions: "آخر المعاملات",
          viewAll: "عرض الكل",
          transaction: "معاملة",
          unknownUser: "مستخدم غير معروف",
        },
        days: {
          Mon: "الإثنين",
          Tue: "الثلاثاء",
          Wed: "الأربعاء",
          Thu: "الخميس",
          Fri: "الجمعة",
          Sat: "السبت",
          Sun: "الأحد",
        },
        statuses: {
          completed: "مكتمل",
          confirmed: "مؤكد",
          pending: "معلق",
          approved: "مقبول",
          rejected: "مرفوض",
        },
        types: {
          deposit: "إيداع",
          withdrawal: "سحب",
        },
      }
    : {
        loading: "Loading...",
        title: "Dashboard Overview",
        subtitle: "Welcome back, Super Admin. Here's what's happening today.",
        vsLastMonth: "vs last month",
        cards: {
          totalUsers: "Total Users",
          totalDeposits: "Total Deposits",
          totalWithdrawals: "Total Withdrawals",
          activeMiningPlans: "Active RIDE Scooters",
          pendingKyc: "Pending KYC",
          pendingWithdrawals: "Pending Withdrawals",
          openSupportTickets: "Open Support Tickets",
        },
        charts: {
          depositsVsWithdrawals: "Deposits vs Withdrawals",
          monthlyVolume: "Monthly transaction volume",
          deposits: "Deposits",
          withdrawals: "Withdrawals",
          userGrowth: "User Growth",
          cumulativeUsers: "Cumulative registered users",
          users: "Users",
          recentTransactions: "Recent Transactions",
          viewAll: "View All",
          transaction: "Transaction",
          unknownUser: "Unknown",
        },
        days: {
          Mon: "Mon",
          Tue: "Tue",
          Wed: "Wed",
          Thu: "Thu",
          Fri: "Fri",
          Sat: "Sat",
          Sun: "Sun",
        },
        statuses: {
          completed: "Completed",
          confirmed: "Confirmed",
          pending: "Pending",
          approved: "Approved",
          rejected: "Rejected",
        },
        types: {
          deposit: "Deposit",
          withdrawal: "Withdrawal",
        },
      };
  const { data: statsData, isLoading } = useStatisticsListQuery({});
  const { data: depositsWithdrawalsApi } = useDepositsWithdrawalsChartQuery();
  const { data: userGrowthApi } = useUserGrowthChartQuery();
  const { data: recentTransactionsApi } = useRecentTransactionsQuery(10);

  const depositWithdrawalData = Array.isArray(depositsWithdrawalsApi?.data?.labels)
    ? depositsWithdrawalsApi.data.labels.map((label, index) => ({
        month: label,
        deposits: Number(
          depositsWithdrawalsApi?.data?.series?.deposits?.[index] || 0,
        ),
        withdrawals: Number(
          depositsWithdrawalsApi?.data?.series?.withdrawals?.[index] || 0,
        ),
      }))
    : [];

  const userGrowthData = Array.isArray(userGrowthApi?.data?.labels)
    ? userGrowthApi.data.labels.map((label, index) => ({
        month: label,
        users: Number(userGrowthApi?.data?.series?.[index] || 0),
      }))
    : [];

  const cards = statsData?.data?.cards || {};

  const formatCount = (value) =>
    Number.isFinite(Number(value)) ? Number(value).toLocaleString(numberLocale) : "--";

  const formatMoney = (value) =>
    Number.isFinite(Number(value))
      ? `${statsData?.data?.currency === "USD" ? "$" : ""}${Number(value).toLocaleString(numberLocale)}`
      : "--";

  const formatDelta = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "--";
    if (numeric > 0) return `+${numeric}%`;
    return `${numeric}%`;
  };

  const getTransactionStatusLabel = (status) => {
    const normalized = String(status || "").toLowerCase();
    return text.statuses[normalized] || status || "-";
  };

  const getTransactionTypeLabel = (transaction) => {
    const raw = String(
      transaction?.label || transaction?.type || text.charts.transaction,
    ).toLowerCase();
    if (raw.includes("deposit")) return text.types.deposit;
    if (raw.includes("withdraw")) return text.types.withdrawal;
    return transaction?.label || transaction?.type || text.charts.transaction;
  };

  const getTransactionStatusClass = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "completed" || normalized === "confirmed") {
      return "text-[#22c55e]";
    }
    if (normalized === "pending") {
      return "text-primary";
    }
    if (normalized === "approved") {
      return "text-[#38bdf8]";
    }
    if (normalized === "rejected") {
      return "text-[#ef4444]";
    }
    return "text-white/70";
  };

  const recentTransactions = Array.isArray(recentTransactionsApi?.data)
    ? recentTransactionsApi.data.map((transaction) => {
        const amount = Number(transaction?.amount || 0);
        const currency = transaction?.currency || "USD";

        return {
          id: transaction?.transactionId,
          user:
            transaction?.user?.name ||
            transaction?.user?.email ||
            text.charts.unknownUser,
          action: `${getTransactionTypeLabel(transaction)} • ${new Date(
            transaction?.createdAt,
          ).toLocaleDateString(numberLocale)}`,
          amount: `${amount >= 0 ? "+" : ""}${amount.toLocaleString(numberLocale)} ${currency}`,
          status: getTransactionStatusLabel(transaction?.status),
          statusClass: getTransactionStatusClass(transaction?.status),
        };
      })
    : [];

  const stats = [
    {
      title: text.cards.totalUsers,
      value: formatCount(cards.totalUsers?.value),
      delta: formatDelta(cards.totalUsers?.changePercent),
      note: text.vsLastMonth,
      icon: User,
      imageClass: "h-4 w-4 object-contain",
      accent: "bg-[#16253f]",
      deltaClass: "text-[#22c55e]",
    },
    {
      title: text.cards.totalDeposits,
      value: formatMoney(cards.totalDeposits?.value),
      delta: formatDelta(cards.totalDeposits?.changePercent),
      note: text.vsLastMonth,
      icon: DollarSign,
      iconClass: "h-4 w-4 text-[#22c55e]",
      accent: "bg-[#152c1f]",
      deltaClass: "text-[#22c55e]",
    },
    {
      title: text.cards.totalWithdrawals,
      value: formatMoney(cards.totalWithdrawals?.value),
      delta: formatDelta(cards.totalWithdrawals?.changePercent),
      note: text.vsLastMonth,
      icon: ArrowUpRight,
      iconClass: "h-4 w-4 text-[#ef4444]",
      accent: "bg-[#31260f]",
      deltaClass: "text-[#22c55e]",
    },
    {
      title: text.cards.activeMiningPlans,
      value: formatCount(cards.activeMiningPlans?.value),
      delta: formatDelta(cards.activeMiningPlans?.changePercent),
      note: text.vsLastMonth,
      icon: Zap,
      iconClass: "h-4 w-4 text-[#a855f7]",
      accent: "bg-[#24193d]",
      deltaClass: "text-[#22c55e]",
    },
    {
      title: text.cards.pendingKyc,
      value: formatCount(cards.pendingKyc?.value),
      delta: formatDelta(cards.pendingKyc?.changePercent),
      note: text.vsLastMonth,
      icon: Shield,
      iconClass: "h-4 w-4 text-[#f59e0b]",
      accent: "bg-[#31260f]",
      deltaClass: cards.pendingKyc?.changePercent > 0 ? "text-[#ef4444]" : "text-[#22c55e]",
    },
    {
      title: text.cards.pendingWithdrawals,
      value: formatCount(cards.pendingWithdrawals?.value),
      delta: formatDelta(cards.pendingWithdrawals?.changePercent),
      note: text.vsLastMonth,
      icon: Clock3,
      iconClass: "h-4 w-4 text-[#ef4444]",
      accent: "bg-[#2f1b1b]",
      deltaClass: "text-[#22c55e]",
    },
    {
      title: text.cards.openSupportTickets,
      value: formatCount(cards.openSupportTickets?.value),
      delta: formatDelta(cards.openSupportTickets?.changePercent),
      note: text.vsLastMonth,
      icon: Headphones,
      iconClass: "h-4 w-4 text-[#22d3ee]",
      accent: "bg-[#102734]",
      deltaClass: cards.openSupportTickets?.changePercent > 0 ? "text-[#ef4444]" : "text-[#22c55e]",
    },
  ];

  return (
    <div className="min-h-screen  p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-white">
            {isLoading ? text.loading : text.title}
          </h1>
          <p className="mt-1 text-sm text-white/45">
            {text.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="rounded-[8px] border border-white/5 bg-sidebar shadow-none"
              >
                <CardContent className="p-3.5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-white/45">{item.title}</div>
                      <div className="mt-5 text-md font-semibold leading-none text-white">
                        {item.value}
                      </div>
                    </div>
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-md ${item.accent}`}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          aria-hidden="true"
                          width={16}
                          height={16}
                          className={item.imageClass}
                        />
                      ) : (
                        <Icon className={item.iconClass} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm leading-none">
                    <span className={item.deltaClass}>{item.delta}</span>
                    <span className="text-white/35">{item.note}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <Card className="rounded-md border border-white/5 bg-sidebar shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-white">
                {text.charts.depositsVsWithdrawals}
              </CardTitle>
              <p className="text-[11px] text-white/40">
                {text.charts.monthlyVolume}
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={depositWithdrawalData}
                    margin={{ top: 12, right: 0, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="depositsFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#ffd100"
                          stopOpacity={0.38}
                        />
                        <stop
                          offset="100%"
                          stopColor="#ffd100"
                          stopOpacity={0.06}
                        />
                      </linearGradient>
                      <linearGradient
                        id="withdrawalsFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.24}
                        />
                        <stop
                          offset="100%"
                          stopColor="#2563eb"
                          stopOpacity={0.04}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="deposits"
                      stroke="#ffd100"
                      strokeWidth={2}
                      fill="url(#depositsFill)"
                      name={text.charts.deposits}
                    />
                    <Area
                      type="monotone"
                      dataKey="withdrawals"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#withdrawalsFill)"
                      name={text.charts.withdrawals}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-[11px]">
                <div className="flex items-center gap-2 text-white/65">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  {text.charts.deposits}
                </div>
                <div className="flex items-center gap-2 text-white/65">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                  {text.charts.withdrawals}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border border-white/5 bg-sidebar shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-white">
                {text.charts.userGrowth}
              </CardTitle>
              <p className="text-[11px] text-white/40">
                {text.charts.cumulativeUsers}
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={userGrowthData}
                    margin={{ top: 12, right: 4, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="userFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.26}
                        />
                        <stop
                          offset="100%"
                          stopColor="#2563eb"
                          stopOpacity={0.03}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ffffff10" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#userFill)"
                      name={text.charts.users}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <Card className="rounded-md border border-white/5 bg-sidebar shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-white">
                {text.charts.depositsVsWithdrawals}
              </CardTitle>
              <p className="text-[11px] text-white/40">
                {text.charts.monthlyVolume}
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={depositWithdrawalData}
                    margin={{ top: 12, right: 0, left: -18, bottom: 0 }}
                    barGap={8}
                  >
                    <CartesianGrid stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="deposits"
                      name={text.charts.deposits}
                      fill="#ffd100"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="withdrawals"
                      name={text.charts.withdrawals}
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-[11px]">
                <div className="flex items-center gap-2 text-white/65">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  {text.charts.deposits}
                </div>
                <div className="flex items-center gap-2 text-white/65">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                  {text.charts.withdrawals}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border border-white/5 bg-sidebar shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-white">
                  {text.charts.recentTransactions}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                className="h-auto px-0 text-xs text-[#22c55e] hover:bg-transparent hover:text-[#22c55e]"
              >
                {text.charts.viewAll}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id || `${transaction.user}-${transaction.amount}`}
                  className="flex items-start justify-between gap-3 border-b border-white/5 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-white">
                      {transaction.user}
                    </div>
                    <div className="mt-1 text-[10px] text-white/35">
                      {transaction.action}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-semibold text-[#22c55e]">
                      {transaction.amount}
                    </div>
                    <div
                      className={`mt-1 text-[10px] ${transaction.statusClass}`}
                    >
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



