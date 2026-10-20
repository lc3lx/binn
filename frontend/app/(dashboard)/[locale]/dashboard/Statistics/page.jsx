"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Clock3,
  Headphones,
  User,
  DollarSign,
  TrendingUp,
  Wallet,
  Activity,
} from "lucide-react";
import {
  useAnalyticsOverviewQuery,
  useDailyEarningsQuery,
  useDepositsWithdrawalsChartQuery,
  usePlanDistributionQuery,
  useUserActivityHourlyQuery,
} from "@/api/services/admin/statistics/analytics.query";
import { useTranslations } from "@/hooks/useTranslations";

function CustomTooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-sidebar px-3 py-2 text-xs text-white shadow-xl">
      {payload.map((entry) => (
        <div key={entry.dataKey || entry.name} className="flex items-center gap-2">
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

export default function AdminStatisticsPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const localeCode = isArabic ? "ar-EG" : "en-US";
  const text = {
    loading: isArabic ? "جاري التحميل..." : "Loading...",
    pageTitle: isArabic ? "الإحصائيات والتحليلات" : "Statistics & Analytics",
    pageSubtitle: isArabic
      ? "نظرة عامة على أداء المنصة"
      : "Platform performance overview",
    cards: {
      profit: isArabic ? "إجمالي أرباح المنصة" : "Total Platform Profit",
      earnings: isArabic ? "إجمالي أرباح التعدين" : "Total Mining Earnings",
      deposits: isArabic ? "إجمالي إيداعات المستخدمين" : "Total User Deposits",
      activeUsers: isArabic ? "المستخدمون النشطون اليوم" : "Active Users Today",
      vsLastMonth: isArabic ? "مقارنة بالشهر الماضي" : "vs last month",
      vsLastHour: isArabic ? "مقارنة بالساعة الماضية" : "vs last hour",
    },
    sections: {
      dailyEarnings: isArabic ? "الأرباح اليومية" : "Daily Earnings",
      dailyEarningsDesc: isArabic
        ? "تدفق أرباح المنصة خلال 7 أيام"
        : "Platform earnings - 7 days flow",
      depositsVsWithdrawals: isArabic
        ? "الإيداعات مقابل السحوبات"
        : "Deposits vs Withdrawals",
      monthlyComparison: isArabic ? "مقارنة شهرية" : "Monthly comparison",
      userActivity: isArabic
        ? "نشاط المستخدمين حسب الساعة"
        : "User Activity by Hour",
      userActivityDesc: isArabic
        ? "عدد المستخدمين النشطين لكل ساعة اليوم"
        : "Today's active users per hour",
      planDistribution: isArabic
        ? "توزيع خطط التعدين"
        : "Mining Plan Distribution",
      noPlanDistribution: isArabic
        ? "لا توجد بيانات لتوزيع الخطط."
        : "No plan distribution data.",
    },
    chart: {
      earnings: isArabic ? "الأرباح" : "Earnings",
      deposits: isArabic ? "الإيداعات" : "Deposits",
      withdrawals: isArabic ? "السحوبات" : "Withdrawals",
      users: isArabic ? "المستخدمون" : "Users",
      subscribers: isArabic ? "مشترك" : "subscribers",
    },
  };

  const { data: analyticsData, isLoading } = useAnalyticsOverviewQuery({});
  const { data: dailyEarningsData } = useDailyEarningsQuery(7);
  const { data: depositsWithdrawalsData } = useDepositsWithdrawalsChartQuery();
  const { data: planDistributionApi } = usePlanDistributionQuery();
  const { data: userActivityHourlyData } = useUserActivityHourlyQuery();

  const cards = analyticsData?.data?.cards || {};

  const statCards = [
    {
      title: text.cards.profit,
      value: isLoading
        ? text.loading
        : `$${(cards.totalPlatformProfit?.value || 0).toLocaleString(localeCode)}`,
      delta: `+${cards.totalPlatformProfit?.changePercent || 0}%`,
      note: text.cards.vsLastMonth,
      icon: DollarSign,
      iconClass: "h-4 w-4 text-[#f59e0b]",
      accent: "bg-[#31260f]",
      deltaClass: "text-[#22c55e]",
    },
    {
      title: text.cards.earnings,
      value: isLoading
        ? text.loading
        : `$${(cards.totalMiningEarnings?.value || 0).toLocaleString(localeCode)}`,
      delta: `+${cards.totalMiningEarnings?.changePercent || 0}%`,
      note: text.cards.vsLastMonth,
      icon: TrendingUp,
      iconClass: "h-4 w-4 text-[#a855f7]",
      accent: "bg-[#24193d]",
      deltaClass: "text-[#22c55e]",
    },
    {
      title: text.cards.deposits,
      value: isLoading
        ? text.loading
        : `$${(cards.totalUserDeposits?.value || 0).toLocaleString(localeCode)}`,
      delta: `+${cards.totalUserDeposits?.changePercent || 0}%`,
      note: text.cards.vsLastMonth,
      icon: Wallet,
      iconClass: "h-4 w-4 text-[#22c55e]",
      accent: "bg-[#152c1f]",
      deltaClass: "text-[#22c55e]",
    },
    {
      title: text.cards.activeUsers,
      value: isLoading
        ? text.loading
        : (cards.activeUsersToday?.value || 0).toLocaleString(localeCode),
      delta: `+${cards.activeUsersToday?.changePercent || 0}`,
      note: text.cards.vsLastHour,
      icon: Activity,
      iconClass: "h-4 w-4 text-[#3b82f6]",
      accent: "bg-[#16253f]",
      deltaClass: "text-[#22c55e]",
    },
  ];

  const earningsData = Array.isArray(dailyEarningsData?.data?.labels)
    ? dailyEarningsData.data.labels.map((label, index) => ({
        day: label,
        value: Number(dailyEarningsData?.data?.series?.[index] || 0),
      }))
    : [];

  const depositWithdrawData = Array.isArray(
    depositsWithdrawalsData?.data?.labels,
  )
    ? depositsWithdrawalsData.data.labels.map((label, index) => ({
        month: label,
        deposits: Number(
          depositsWithdrawalsData?.data?.series?.deposits?.[index] || 0,
        ),
        withdrawals: Number(
          depositsWithdrawalsData?.data?.series?.withdrawals?.[index] || 0,
        ),
      }))
    : [];

  const userActivityData = Array.isArray(userActivityHourlyData?.data?.labels)
    ? userActivityHourlyData.data.labels.map((label, index) => ({
        time: label,
        users: Number(userActivityHourlyData?.data?.series?.[index] || 0),
      }))
    : [];

  const planColors = ["#7c6bf1", "#7fd8bc", "#f1d64b", "#ff8a4c", "#55a3ff"];
  const planDistributionData = Array.isArray(planDistributionApi?.data?.labels)
    ? planDistributionApi.data.labels.map((label, index) => {
        const item = Array.isArray(planDistributionApi?.data?.items)
          ? planDistributionApi.data.items[index]
          : null;

        return {
          name:
            item?.name || label || `${isArabic ? "خطة" : "Plan"} ${index + 1}`,
          value: Number(planDistributionApi?.data?.series?.[index] || 0),
          range:
            label || item?.name || `${isArabic ? "خطة" : "Plan"} ${index + 1}`,
          subscribers:
            item?.subscribersText ||
            (item?.subscribersCount != null
              ? `${item.subscribersCount.toLocaleString(localeCode)} ${text.chart.subscribers}`
              : ""),
          color: planColors[index % planColors.length],
        };
      })
    : [];

  return (
    <div
      className="min-h-screen bg-background p-4 text-white sm:p-6"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-white">
            {isLoading ? text.loading : text.pageTitle}
          </h1>
          <p className="mt-1 text-sm text-white/45">{text.pageSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => {
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
                      <div className="mt-5 text-lg font-semibold leading-none text-white">
                        {item.value}
                      </div>
                    </div>
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-md ${item.accent}`}
                    >
                      <Icon className={item.iconClass} />
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

        <div className="mt-4">
          <Card className="rounded-md border border-white/5 bg-sidebar shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-white">
                {text.sections.dailyEarnings}
              </CardTitle>
              <p className="text-[11px] text-white/40">
                {text.sections.dailyEarningsDesc}
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[310px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={earningsData}
                    margin={{ top: 10, right: 8, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="earningsFill"
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
                    </defs>
                    <CartesianGrid stroke="#ffffff10" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip content={CustomTooltipContent} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ffd100"
                      strokeWidth={2}
                      fill="url(#earningsFill)"
                      name={text.chart.earnings}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-md border border-white/5 bg-sidebar shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-white">
                {text.sections.depositsVsWithdrawals}
              </CardTitle>
              <p className="text-[11px] text-white/40">
                {text.sections.monthlyComparison}
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={depositWithdrawData}
                    margin={{ top: 12, right: 0, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="depositsFillStats"
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
                      <linearGradient
                        id="withdrawalsFillStats"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#ffd100"
                          stopOpacity={0.24}
                        />
                        <stop
                          offset="100%"
                          stopColor="#ffd100"
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
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip content={CustomTooltipContent} />
                    <Area
                      type="monotone"
                      dataKey="deposits"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#depositsFillStats)"
                      name={text.chart.deposits}
                    />
                    <Area
                      type="monotone"
                      dataKey="withdrawals"
                      stroke="#ffd100"
                      strokeWidth={2}
                      fill="url(#withdrawalsFillStats)"
                      name={text.chart.withdrawals}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-[11px]">
                <div className="flex items-center gap-2 text-white/65">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                  {text.chart.deposits}
                </div>
                <div className="flex items-center gap-2 text-white/65">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  {text.chart.withdrawals}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border border-white/5 bg-sidebar shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-white">
                {text.sections.userActivity}
              </CardTitle>
              <p className="text-[11px] text-white/40">
                {text.sections.userActivityDesc}
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={userActivityData}
                    margin={{ top: 12, right: 4, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="userHourFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.2}
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
                      dataKey="time"
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#7f7f83", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={CustomTooltipContent} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#userHourFill)"
                      name={text.chart.users}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4 rounded-md border border-white/5 bg-sidebar shadow-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-white">
              {text.sections.planDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {planDistributionData.length === 0 ? (
              <div className="py-6 text-center text-sm text-white/45">
                {text.sections.noPlanDistribution}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
                <div className="relative">
                  <div className="relative h-[190px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planDistributionData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={32}
                          outerRadius={58}
                          paddingAngle={0}
                          cx="48%"
                          cy="52%"
                        >
                          {planDistributionData.map((entry, index) => (
                            <Cell
                              key={`${entry.name}-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={CustomTooltipContent} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[9px] text-white/55">
                    {planDistributionData.map((entry, index) => (
                      <div
                        key={`${entry.range}-${index}`}
                        className="flex items-center gap-1"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span>
                          {entry.range} {entry.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {planDistributionData.slice(0, 4).map((plan, index) => (
                    <div
                      key={`${plan.name}-${index}`}
                      className="rounded-md border border-white/10 bg-[#2d2d2f] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: plan.color }}
                        />
                        <div className="text-sm font-medium text-white">
                          {plan.name}
                        </div>
                      </div>
                      <div className="mt-1 text-[10px] text-white/35">
                        {plan.subscribers || "--"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
