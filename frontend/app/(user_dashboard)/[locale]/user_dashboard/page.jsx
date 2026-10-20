"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Option,
  Wallet,
  MoreVertical,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  useAllocationQuery,
  useDashboardSummaryQuery,
  useHashrateSeriesQuery,
  useRecentActivityQuery,
} from "@/api/services/user/Statistics/statistics.query";

export default function UserDashboardPage() {
  const { t, locale } = useTranslations();
  const [activeTab, setActiveTab] = useState("chart");
  const [hashrateRange, setHashrateRange] = useState("1W");
  const text =
    locale === "ar"
      ? {
          upgradePlan: "ترقية الخطة",
          currentBalance: "الرصيد الحالي",
          monthlyProfit: "الربح الشهري",
          totalProfit: "إجمالي الربح",
          allTimeEarnings: "إجمالي الأرباح",
          daysRemaining: "الأيام المتبقية",
          more: "المزيد",
          addCrypto: "إضافة رصيد",
          chart: "المخطط",
          allocation: "التخصيص",
          statistics: "الإحصائيات",
          balance: "الرصيد",
          bitcoinHashrate: "معدل هاش البيتكوين (TH/s)",
          hashrate: "معدل الهاش",
          hashrateHint:
            "هذا تقدير لعدد التيراهاش في الثانية التي تنتجها الشبكة خلال آخر 24 ساعة.",
          learnMore: "اعرف المزيد",
          noActivePlan: "لا توجد خطة نشطة",
          active: "نشطة",
          inactive: "غير نشطة",
          hashratePower: "قوة الهاشريت",
          estimatedRoi: "العائد المتوقع",
          monthlySuffix: "شهرياً",
          planProgress: "تقدم الخطة",
          started: "بدأت",
          ends: "تنتهي",
          dailyYield: "العائد اليومي",
          hardware: "الخطة",
          status: "الحالة",
          running: "قيد التشغيل",
          activity: "النشاط",
          farm: "المعرف",
          name: "الاسم",
          quantity: "الكمية",
          pendingRewards: "القدرة",
          actions: "الإجراءات",
          buy: "شراء",
          stake: "تفعيل",
          noAllocation: "لا يوجد تخصيصات حالياً",
        }
      : {
          upgradePlan: "Upgrade Plan",
          currentBalance: "Current Balance",
          monthlyProfit: "Monthly Profit",
          totalProfit: "Total Profit",
          allTimeEarnings: "All time earnings",
          daysRemaining: "Days Remaining",
          more: "More",
          addCrypto: "Add crypto",
          chart: "Chart",
          allocation: "Allocation",
          statistics: "Statistics",
          balance: "Balance",
          bitcoinHashrate: "Bitcoin Hashrate (TH/s)",
          hashrate: "Hashrate",
          hashrateHint:
            "The estimated number of terahashes per second the bitcoin network is performing in the last 24 hours.",
          learnMore: "Learn more.",
          noActivePlan: "No Active Plan",
          active: "Active",
          inactive: "Inactive",
          hashratePower: "Hashrate Power",
          estimatedRoi: "Estimated ROI",
          monthlySuffix: "Monthly",
          planProgress: "Plan Progress",
          started: "Started",
          ends: "Ends",
          dailyYield: "Daily Yield",
          hardware: "Hardware",
          status: "Status",
          running: "Running",
          activity: "Activity",
          farm: "Farm",
          name: "Name",
          quantity: "Quantity",
          pendingRewards: "Pending Rewards",
          actions: "Actions",
          buy: "Buy",
          stake: "Stake",
          noAllocation: "No allocation found",
        };

  const rangeToDays = {
    "24H": 1,
    "1W": 7,
  };
  const hashrateDaysFilter = rangeToDays[hashrateRange] ?? 14;
  const { data: summaryResponse } = useDashboardSummaryQuery();
  const { data: hashrateSeriesResponse } =
    useHashrateSeriesQuery(hashrateDaysFilter);
  const { data: recentActivityResponse } = useRecentActivityQuery(10);
  const { data: allocationResponse } = useAllocationQuery();

  const summary = summaryResponse?.data || {};
  const totals = summary?.totals || {};
  const activePlans = Array.isArray(summary?.activePlans)
    ? summary.activePlans
    : [];
  const primaryPlan = activePlans[0] || null;
  const currency = summary?.currency || "USD";

  const balance = Number(summary?.walletBalance || 0);
  const monthlyProfit = Number(totals?.estimatedMonthlyDividends || 0);
  const totalProfit = Number(totals?.estimatedDailyPnL || 0);
  const realizedTodayPnL = Number(totals?.realizedTodayPnL || 0);
  const rawBalanceChangePercent =
    summary?.walletChangePercent ?? summary?.balanceChangePercent ?? null;
  const hasBalanceChangePercent =
    rawBalanceChangePercent !== null &&
    rawBalanceChangePercent !== undefined &&
    !Number.isNaN(Number(rawBalanceChangePercent));
  const balanceChangePercent = hasBalanceChangePercent
    ? Number(rawBalanceChangePercent)
    : 0;
  const daysRemainingMin = Number(totals?.remainingDaysMin || 0);
  const daysRemainingMax = Number(totals?.remainingDaysMax || 0);
  const daysRemaining =
    daysRemainingMin &&
    daysRemainingMax &&
    daysRemainingMin !== daysRemainingMax
      ? `${daysRemainingMin}-${daysRemainingMax}`
      : `${daysRemainingMax || daysRemainingMin || 0}`;
  const activePlan = primaryPlan?.planName
    ? primaryPlan.planName
    : activePlans.length
      ? locale === "ar"
        ? `${activePlans.length} خطط نشطة`
        : `${activePlans.length} Active Plans`
      : text.noActivePlan;

  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  const hashratePoints = Array.isArray(hashrateSeriesResponse?.data?.points)
    ? hashrateSeriesResponse.data.points
    : [];
  const hashrateData = hashratePoints.map((point) => {
    const d = new Date(point?.date);
    const shortLabel = d.toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-US",
      {
        day: "numeric",
      },
    );
    return {
      shortLabel,
      profit: Number(point?.hashrateTotal || 0),
    };
  });

  const statusLabels = {
    ar: {
      completed: "مكتمل",
      confirmed: "مؤكد",
      pending: "قيد الانتظار",
      approved: "مقبول",
      rejected: "مرفوض",
    },
    en: {
      completed: "Completed",
      confirmed: "Confirmed",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    },
  };

  const typeLabels = {
    ar: {
      plan_purchase: "شراء خطة",
      deposit: "إيداع",
      withdrawal: "سحب",
    },
    en: {
      plan_purchase: "Plan Purchase",
      deposit: "Deposit",
      withdrawal: "Withdrawal",
    },
  };

  const recentActivity = Array.isArray(recentActivityResponse?.data)
    ? recentActivityResponse.data.map((item) => {
        const type = String(item?.type || "").toLowerCase();
        const status = String(item?.status || "").toLowerCase();
        const amountValue = Number(item?.amount || 0);
        const currency = item?.currency || "USD";

        const isDown =
          type.includes("withdraw") || status === "rejected" || amountValue < 0;

        const statusClass =
          status === "completed" || status === "confirmed"
            ? "text-[#22e47b]"
            : status === "pending"
              ? "text-primary"
              : status === "rejected"
                ? "text-[#ef4444]"
                : "text-white/70";

        return {
          id: item?.transactionId,
          title:
            typeLabels[locale]?.[type] ||
            item?.label ||
            typeLabels.en[type] ||
            "Transaction",
          amount: `${isDown ? "-" : "+"}${Math.abs(amountValue).toLocaleString(
            locale === "ar" ? "ar-EG" : "en-US",
            { maximumFractionDigits: 2 },
          )} ${currency}`,
          status:
            statusLabels[locale]?.[status] ||
            item?.status ||
            statusLabels.en[status] ||
            "-",
          statusClass,
          time: new Date(item?.createdAt).toLocaleString(
            locale === "ar" ? "ar-EG" : "en-US",
            {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
          direction: isDown ? "down" : "up",
        };
      })
    : [];

  const rawActivity = Array.isArray(recentActivityResponse?.data)
    ? [...recentActivityResponse.data]
    : [];

  const chartData = (() => {
    // Build a real balance timeline from actual transactions.
    if (rawActivity.length > 0) {
      const isFinalized = (status) =>
        ["completed", "confirmed", "approved"].includes(
          String(status || "").toLowerCase(),
        );

      const toDelta = (tx) => {
        if (!isFinalized(tx?.status)) return 0;
        const amount = Number(tx?.amount || 0);
        const type = String(tx?.type || "").toLowerCase();

        if (type.includes("withdraw") || type.includes("plan_purchase")) {
          return -Math.abs(amount);
        }
        return Math.abs(amount);
      };

      const sorted = rawActivity.sort(
        (a, b) =>
          new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime(),
      );
      const netChange = sorted.reduce((sum, tx) => sum + toDelta(tx), 0);
      const initialBalance = Number(balance || 0) - netChange;
      const { points } = sorted.reduce(
        (acc, tx) => {
          const nextRunning = acc.running + toDelta(tx);
          return {
            running: nextRunning,
            points: [
              ...acc.points,
              {
                month: new Date(tx?.createdAt).toLocaleDateString(
                  locale === "ar" ? "ar-EG" : "en-US",
                  { month: "short", day: "numeric", timeZone: "UTC" },
                ),
                profit: Number(nextRunning.toFixed(2)),
              },
            ],
          };
        },
        { running: initialBalance, points: [] },
      );

      return points;
    }

    return [];
  })();
  const chartReferenceX =
    chartData.length > 2
      ? chartData[Math.floor(chartData.length / 2)]?.month
      : undefined;

  const farmActivity = Array.isArray(allocationResponse?.data?.allocation)
    ? allocationResponse.data.allocation.map((item, index) => {
        const planId = String(item?.planId || "");
        return {
          id: planId || `allocation-${index}`,
          farm: `#${planId.slice(-6).toUpperCase() || index + 1}`,
          name: item?.planName || "Plan",
          quantity: Number(item?.hashrate || 0),
          rewards: `${Number(item?.hashrate || 0)} ${item?.hashrateUnit || "TH/s"}`,
        };
      })
    : [];

  const formatMoney = (value) =>
    `${currency === "USD" ? "$" : ""}${nf.format(Number(value || 0))}`;

  const planHashrateValue = Number(totals?.totalHashrate || 0);
  const planHashrateUnit = primaryPlan?.hashrateUnit || "TH/s";
  const roiMin = Number(primaryPlan?.roiMinPercent || 0);
  const roiMax = Number(primaryPlan?.roiMaxPercent || 0);
  const estimatedRoiLabel =
    roiMin > 0 && roiMax > 0
      ? `+${((roiMin + roiMax) / 2).toFixed(1)}% ${text.monthlySuffix}`
      : "--";

  const subscribedAt = primaryPlan?.subscribedAt
    ? new Date(primaryPlan.subscribedAt)
    : null;
  const expiresAt = primaryPlan?.expiresAt
    ? new Date(primaryPlan.expiresAt)
    : null;
  const now = new Date();
  const totalDurationMs =
    subscribedAt && expiresAt
      ? expiresAt.getTime() - subscribedAt.getTime()
      : 0;
  const elapsedMs =
    subscribedAt && expiresAt ? now.getTime() - subscribedAt.getTime() : 0;
  const planProgress =
    totalDurationMs > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100)),
        )
      : 0;

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {t("sidebar.items.overview")}
          </h1>
          <Button asChild>
            <Link href={`/${locale}/user_dashboard/mining_plans`}>
              <Image
                src="/plan.svg"
                alt="svg"
                width={16}
                height={16}
                className="h-4 w-4"
              />
              <span className="ml-2 rtl:mr-2">{text.upgradePlan}</span>
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {text.currentBalance}
              </CardTitle>
              <Wallet className="text-primary w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMoney(balance)}</div>
              <p className="text-xs text-muted-foreground mt-1">{currency}</p>
            </CardContent>
          </Card>

          {/* Monthly Profit Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {text.monthlyProfit}
              </CardTitle>
              <ArrowUpRight className="text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatMoney(monthlyProfit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {text.dailyYield}: {formatMoney(realizedTodayPnL)}
              </p>
            </CardContent>
          </Card>

          {/* Total Profit Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {text.totalProfit}
              </CardTitle>
              <Image
                src="/mony.svg"
                alt="svg"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatMoney(totalProfit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {text.allTimeEarnings}
              </p>
            </CardContent>
          </Card>

          {/* Days Remaining Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {text.daysRemaining}
              </CardTitle>
              <Image
                src="/day.svg"
                alt="svg"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daysRemaining}</div>
              <p className="text-xs text-muted-foreground mt-1">{activePlan}</p>
            </CardContent>
          </Card>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.85fr)]">
          <Card className=" bg-transparent !border-none shadow-none">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col">
                    <div className="text-sm text-white/55">
                      {text.currentBalance}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="text-3xl font-bold text-white sm:text-4xl">
                        {formatMoney(balance)}
                      </div>
                      {hasBalanceChangePercent ? (
                        <span
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                            balanceChangePercent >= 0
                              ? "bg-[#1f2f1e] text-[#8bd97b]"
                              : "bg-[#301a1a] text-[#ff8d8d]"
                          }`}
                        >
                          <ArrowUpRight
                            className={`h-3 w-3 ${
                              balanceChangePercent < 0 ? "rotate-90" : ""
                            }`}
                          />
                          {balanceChangePercent >= 0 ? "+" : ""}
                          {balanceChangePercent.toFixed(2)}%
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-[#3ddc84]">
                      {realizedTodayPnL >= 0 ? "+" : ""}{" "}
                      {formatMoney(realizedTodayPnL)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={activeTab === "chart" ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("chart")}
                    className={
                      activeTab === "chart"
                        ? "h-8 border-white/10 bg-[#3a3a3a] px-4 text-white hover:bg-[#434343]"
                        : "h-8 px-3 text-white/40 hover:text-primary"
                    }
                  >
                    {text.chart}
                  </Button>
                  <Button
                    variant={activeTab === "allocation" ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("allocation")}
                    className={
                      activeTab === "allocation"
                        ? "h-8 border-white/10 bg-[#3a3a3a] px-4 text-white hover:bg-[#434343]"
                        : "h-8 px-3 text-white/40 hover:text-primary"
                    }
                  >
                    {text.allocation}
                  </Button>
                  <Button
                    variant={activeTab === "statistics" ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("statistics")}
                    className={
                      activeTab === "statistics"
                        ? "h-8 border-white/10 bg-[#3a3a3a] px-4 text-white hover:bg-[#434343]"
                        : "h-8 px-3 text-white/40 hover:text-primary"
                    }
                  >
                    {text.statistics}
                  </Button>
                </div>

                {activeTab === "chart" ? (
                  <div className="h-[250px] w-full">
                    {chartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 8, right: 0, left: -24, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="balanceFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#ffd100"
                                stopOpacity={0.34}
                              />
                              <stop
                                offset="65%"
                                stopColor="#ffd100"
                                stopOpacity={0.12}
                              />
                              <stop
                                offset="100%"
                                stopColor="#ffd100"
                                stopOpacity={0.03}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            vertical={false}
                            stroke="#ffffff10"
                            strokeDasharray="3 4"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: "#6f6f6f", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: "#6f6f6f", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            domain={["dataMin - 80", "dataMax + 80"]}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#1c1c1c",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "#fff",
                            }}
                            formatter={(value) => [
                              `$ ${nf.format(value)}`,
                              text.balance,
                            ]}
                          />
                          {chartReferenceX ? (
                            <ReferenceLine
                              x={chartReferenceX}
                              stroke="#ffd100"
                              strokeOpacity={0.55}
                            />
                          ) : null}
                          <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="#ffd100"
                            strokeWidth={2}
                            fill="url(#balanceFill)"
                            dot={false}
                            activeDot={{
                              r: 4,
                              fill: "#ffd100",
                              stroke: "#232323",
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-white/55">
                        {text.noAllocation}
                      </div>
                    )}
                  </div>
                ) : null}

                {activeTab === "allocation" ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {farmActivity.length ? (
                      farmActivity.map((item) => (
                        <div
                          key={item.id || item.farm}
                          className="rounded-lg border border-white/10 bg-black/20 p-3"
                        >
                          <div className="text-xs text-white/50">
                            {item.farm}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-white">
                            {item.name}
                          </div>
                          <div className="mt-2 text-xs text-white/65">
                            {text.quantity}: {item.quantity}
                          </div>
                          <div className="text-xs text-primary">
                            {item.rewards}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full rounded-lg border border-white/10 p-4 text-center text-sm text-white/55">
                        {text.noAllocation}
                      </div>
                    )}
                  </div>
                ) : null}

                {activeTab === "statistics" ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/50">
                        {text.hashrate}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {planHashrateValue} {planHashrateUnit}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/50">
                        {text.dailyYield}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {nf.format(Number(totals?.estimatedDailyPnL || 0))}{" "}
                        {currency}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/50">
                        {text.allocation}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {Number(totals?.activePlansCount || 0)}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-0 bg-card shadow-none">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 text-sm font-semibold text-white">
                {text.bitcoinHashrate}
              </div>
              <div className="mb-4 flex items-center justify-center gap-3">
                {["24H", "1W"].map((range) => (
                  <Button
                    key={range}
                    size="sm"
                    variant={hashrateRange === range ? "outline" : "ghost"}
                    onClick={() => setHashrateRange(range)}
                    className={
                      hashrateRange === range
                        ? "h-7 rounded-md border-0  px-2 text-[11px] text-white hover:bg-[#403d4a]"
                        : "h-7 rounded-md px-3 text-[11px] text-white/70 hover:bg-transparent hover:text-white"
                    }
                  >
                    {range}
                  </Button>
                ))}
              </div>
              <div className="h-[230px] rounded-none w-full   p-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={hashrateData}
                    margin={{ top: 12, right: 0, left: 0, bottom: 18 }}
                  >
                    <defs>
                      <linearGradient
                        id="hashrateFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#ffd100"
                          stopOpacity={0.34}
                        />
                        <stop
                          offset="100%"
                          stopColor="#ffd100"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical
                      stroke="#ffffff12"
                      strokeDasharray="0"
                    />
                    <XAxis
                      dataKey="shortLabel"
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      minTickGap={14}
                      tick={{ fill: "#b8bdc8", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={30}
                      tickMargin={8}
                      tick={{ fill: "#b8bdc8", fontSize: 11 }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1c1c1c",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                      }}
                      formatter={(value) => [
                        `${(value / 1000).toFixed(1)}k`,
                        text.hashrate,
                      ]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload
                          ? payload[0].payload.shortLabel
                          : ""
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#ffd100"
                      strokeWidth={2}
                      fill="url(#hashrateFill)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "#ffd100",
                        stroke: "#2a2616",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-5 text-[11px] leading-5 text-white/45">
                {text.hashrateHint}
                <span className="ml-1 font-semibold text-primary">
                  {text.learnMore}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <div className="flex flex-col gap-6">
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-0">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">
                          {primaryPlan?.planName || text.noActivePlan}
                        </h3>
                        <span className="rounded-md bg-primary/25 px-3 py-1 text-xs font-semibold text-primary">
                          {activePlans.length ? text.active : text.inactive}
                        </span>
                      </div>
                      <p className="mt-2 text-lg text-white/60">
                        {planHashrateValue} {planHashrateUnit}{" "}
                        {text.hashratePower}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-xs text-white/55">
                        {text.estimatedRoi}
                      </div>
                      <div className="mt-2 text-[1.7rem] font-bold text-[#22e47b]">
                        {estimatedRoiLabel}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-base text-white/65">
                        {text.planProgress}
                      </span>
                      <span className="text-xl font-bold text-white">
                        {planProgress}%
                      </span>
                    </div>
                    <Progress
                      value={planProgress}
                      className="h-3 bg-black/60 [&>div]:bg-primary"
                    />
                    <div className="mt-3 flex flex-col gap-2 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        {text.started}:{" "}
                        {subscribedAt
                          ? subscribedAt.toLocaleDateString(
                              locale === "ar" ? "ar-EG" : "en-US",
                            )
                          : "--"}
                      </span>
                      <span>
                        {text.ends}:{" "}
                        {expiresAt
                          ? expiresAt.toLocaleDateString(
                              locale === "ar" ? "ar-EG" : "en-US",
                            )
                          : "--"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-card pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <div>
                        <div className="text-sm text-white/55">
                          {text.dailyYield}
                        </div>
                        <div className="mt-2 text-lg font-bold text-white">
                          {nf.format(Number(totals?.estimatedDailyPnL || 0))}{" "}
                          <span className="text-primary">{currency}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/55">
                          {text.hardware}
                        </div>
                        <div className="mt-2 text-lg font-bold text-white">
                          {primaryPlan?.planName || "--"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/55">
                          {text.status}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-lg font-bold text-[#22e47b]">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#22e47b]" />
                          {activePlans.length ? text.running : text.inactive}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-md border-0 bg-card shadow-none">
              <CardContent className="p-0">
                <div className="px-4 pb-2 pt-4 sm:px-5">
                  <h3 className="text-lg font-medium text-gray-200">
                    {text.activity}
                  </h3>
                </div>
                <Table className="rounded-none border-0 bg-transparent">
                  <TableHeader className="bg-transparent text-center">
                    <TableRow className="h-auto border-b border-white/20 hover:bg-transparent">
                      <TableHead className="px-4 pb-3 pt-2 text-xs font-normal text-white/55 sm:px-5">
                        {text.farm}
                      </TableHead>
                      <TableHead className="px-4 pb-3 pt-2 text-xs font-normal text-white/55">
                        {text.name}
                      </TableHead>
                      <TableHead className="px-4 pb-3 pt-2 text-xs font-normal text-white/55">
                        {text.quantity}
                      </TableHead>
                      <TableHead className="px-4 pb-3 pt-2 text-xs font-normal text-white/55">
                        {text.pendingRewards}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-transparent text-center">
                    {farmActivity.length ? (
                      farmActivity.map((item) => (
                        <TableRow
                          key={item.id || item.farm}
                          className="border-b border-transparent hover:bg-white/[0.02]"
                        >
                          <TableCell className="px-4 py-4 text-sm  text-white/75 sm:px-5">
                            {item.farm}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm text-white/65">
                            {item.name}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm text-white/65">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm  text-white/75">
                            {item.rewards}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="px-4 py-6 text-center text-sm text-white/55"
                        >
                          {text.noAllocation}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <ScrollArea className="h-96 p-6 bg-card lg:ml-8  rounded-lg ">
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div
                  key={item.id || `${item.title}-${index}`}
                  className="flex items-start gap-3"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card ring-1 ring-white/6">
                    {item.direction === "down" ? (
                      <ArrowDownRight className="h-4 w-4 text-[#ff6f6f]" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-[#22e47b]" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs text-white/45">
                        {item.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-base font-semibold ${
                          item.direction === "down"
                            ? "text-white"
                            : "text-[#22e47b]"
                        }`}
                      >
                        {item.amount}
                      </div>
                      <div
                        className={`mt-1 text-xs font-semibold ${item.statusClass}`}
                      >
                        {item.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
