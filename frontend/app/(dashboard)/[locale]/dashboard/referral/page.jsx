"use client";

import { toast } from "sonner";
import { useTranslations } from "@/hooks/useTranslations";
import {
  useReferralGrowthChartQuery,
  useReferralOverviewQuery,
  useTopReferrersQuery,
} from "@/api/services/admin/referral/referral.query";
import { Copy, DollarSign, Share2, TrendingUp, UserRound, BadgePercent } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminReferralPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const numberLocale = isArabic ? "ar-EG" : "en-US";

  const text = isArabic
    ? {
        title: "نظام الإحالة",
        subtitle: "إدارة وتتبع أداء برنامج الإحالة",
        commissionRate: "معدل العمولة",
        loading: "جارٍ تحميل بيانات الإحالة...",
        error: "تعذر تحميل بيانات الإحالة",
        stats: {
          totalReferrals: "إجمالي الإحالات",
          totalCommissions: "إجمالي العمولات",
          activeReferrers: "المحيلون النشطون",
          avgPerReferrer: "المتوسط لكل محيل",
        },
        chartTitle: "نمو الإحالة",
        settingsTitle: "إعدادات العمولة",
        fields: {
          level1: "عمولة المستوى الأول (%)",
          level2: "عمولة المستوى الثاني (%)",
          minWithdrawal: "الحد الأدنى للسحب ($)",
        },
        save: "حفظ الإعدادات",
        topReferrers: "أفضل المحيلين",
        table: {
          rank: "الترتيب",
          name: "الاسم",
          code: "كود الإحالة",
          referrals: "إجمالي الإحالات",
          earnings: "الأرباح",
          rate: "النسبة",
        },
        copied: "تم نسخ كود الإحالة",
      }
    : {
        title: "Referral System",
        subtitle: "Manage and track referral performance",
        commissionRate: "Commission Rate",
        loading: "Loading referral overview...",
        error: "Failed to load referral overview",
        stats: {
          totalReferrals: "Total Referrals",
          totalCommissions: "Total Commissions",
          activeReferrers: "Active Referrers",
          avgPerReferrer: "Avg per Referrer",
        },
        chartTitle: "Referral Growth",
        settingsTitle: "Commission Settings",
        fields: {
          level1: "Level 1 Commission (%)",
          level2: "Level 2 Commission (%)",
          minWithdrawal: "Min Withdrawal ($)",
        },
        save: "Save Settings",
        topReferrers: "Top Referrers",
        table: {
          rank: "Rank",
          name: "Name",
          code: "Referral Code",
          referrals: "Total Referrals",
          earnings: "Earnings",
          rate: "Rate",
        },
        copied: "Referral code copied",
      };

  const { data, isLoading, isError, error } = useReferralOverviewQuery();
  const { data: growthData } = useReferralGrowthChartQuery();
  const { data: topReferrersData } = useTopReferrersQuery(20);
  const overview = data?.data || {};
  const currency = overview?.currency || "USD";
  const alignClass = isArabic ? "text-right" : "text-left";

  // Static commission form is intentionally disabled for now.
  // const [form, setForm] = useState({
  //   level1: "5",
  //   level2: "2",
  //   minWithdrawal: "50",
  // });

  const growthLabels = Array.isArray(growthData?.data?.labels)
    ? growthData.data.labels
    : [];
  const growthSeries = Array.isArray(growthData?.data?.series)
    ? growthData.data.series
    : [];
  const chartData = growthLabels.map((label, index) => ({
    month: label,
    value: Number(growthSeries[index] || 0),
  }));

  const topReferrers = Array.isArray(topReferrersData?.data)
    ? topReferrersData.data.map((item, index) => ({
        rank: String(index + 1),
        name: item?.name || item?.user?.name || "--",
        code: item?.referralCode || item?.code || "--",
        referrals: Number(item?.totalReferrals || item?.referrals || 0),
        earnings: Number(item?.earnings || item?.totalCommissions || 0),
        rate:
          item?.rate != null
            ? `${Number(item.rate)}%`
            : item?.commissionRate != null
              ? `${Number(item.commissionRate)}%`
              : "--",
      }))
    : [];

  const statCards = [
    {
      title: text.stats.totalReferrals,
      value: Number(overview?.totalReferrals || 0),
      icon: UserRound,
      iconClass: "bg-[#1d3b61] text-[#5aa9ff]",
      money: false,
    },
    {
      title: text.stats.totalCommissions,
      value: Number(overview?.totalCommissionsPaid || 0),
      icon: DollarSign,
      iconClass: "bg-[#3a3216] text-primary",
      money: true,
    },
    {
      title: text.stats.activeReferrers,
      value: Number(overview?.activeReferrers || 0),
      icon: Share2,
      iconClass: "bg-[#352450] text-[#b78cff]",
      money: false,
    },
    {
      title: text.stats.avgPerReferrer,
      value: Number(overview?.avgPerReferrer || 0),
      icon: TrendingUp,
      iconClass: "bg-[#3a2a1a] text-[#f59e0b]",
      money: true,
    },
  ];

  const onCopyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    toast.success(text.copied);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 text-white sm:p-6">
        <div className="mx-auto max-w-7xl rounded-lg border border-white/10 bg-sidebar p-4 text-sm text-white/70">
          {text.loading}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-4 text-white sm:p-6">
        <div className="mx-auto max-w-7xl rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error?.response?.data?.message || text.error}
        </div>
      </div>
    );
  }

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{text.title}</h1>
            <p className="mt-1 text-sm text-[#8aa5c5]">{text.subtitle}</p>
          </div>
          {/* Static badge disabled until dynamic commission endpoint is added */}
          {/* <div className="inline-flex items-center gap-2 rounded-lg border border-primary/35 bg-primary/10 px-3 py-2 text-primary">
            <BadgePercent className="h-4 w-4" />
            <span className="text-sm font-semibold">{text.commissionRate} 5%</span>
          </div> */}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="rounded-lg border-white/10 bg-sidebar shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#8aa5c5]">{item.title}</p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {item.money ? `${currency === "USD" ? "$" : ""}` : ""}
                        {item.value.toLocaleString(numberLocale)}
                      </p>
                    </div>
                    <span className={`grid h-9 w-9 place-items-center rounded-md ${item.iconClass}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="rounded-lg border-white/10 bg-sidebar shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-white">{text.chartTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#ffffff10" strokeDasharray="3 4" />
                  <XAxis dataKey="month" tick={{ fill: "#7f8ca5", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: "#7f8ca5", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                  <Tooltip
                    contentStyle={{
                      background: "#2a2d33",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="#f4d136" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Static commission settings disabled until API integration is added */}
        {/* <Card className="rounded-lg border-white/10 bg-sidebar shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-white">{text.settingsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs text-[#8db1db]">{text.fields.level1}</label>
              <Input
                value={form.level1}
                onChange={(e) => setForm((prev) => ({ ...prev, level1: e.target.value }))}
                className="h-10 border-white/10 bg-[#383b41] text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#8db1db]">{text.fields.level2}</label>
              <Input
                value={form.level2}
                onChange={(e) => setForm((prev) => ({ ...prev, level2: e.target.value }))}
                className="h-10 border-white/10 bg-[#383b41] text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#8db1db]">{text.fields.minWithdrawal}</label>
              <Input
                value={form.minWithdrawal}
                onChange={(e) => setForm((prev) => ({ ...prev, minWithdrawal: e.target.value }))}
                className="h-10 border-white/10 bg-[#383b41] text-sm text-white"
              />
            </div>
            <Button className="mt-2 h-10 w-full">{text.save}</Button>
          </CardContent>
        </Card> */}

        <Card className="rounded-lg border-white/10 bg-sidebar shadow-none">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl text-white">{text.topReferrers}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className={`w-[10%] px-3 text-[#5a6b84] ${alignClass}`}>{text.table.rank}</TableHead>
                  <TableHead className={`w-[24%] px-3 text-[#5a6b84] ${alignClass}`}>{text.table.name}</TableHead>
                  <TableHead className={`w-[22%] px-3 text-[#5a6b84] ${alignClass}`}>{text.table.code}</TableHead>
                  <TableHead className={`w-[18%] px-3 text-[#5a6b84] ${alignClass}`}>{text.table.referrals}</TableHead>
                  <TableHead className={`w-[16%] px-3 text-[#5a6b84] ${alignClass}`}>{text.table.earnings}</TableHead>
                  <TableHead className={`w-[10%] px-3 text-[#5a6b84] ${alignClass}`}>{text.table.rate}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topReferrers.length ? (
                  topReferrers.map((row) => (
                    <TableRow key={`${row.code}-${row.rank}`} className="border-white/10 hover:bg-white/[0.02]">
                      <TableCell className={`px-3 text-sm text-white ${alignClass}`}>{row.rank}</TableCell>
                      <TableCell className={`px-3 text-sm font-semibold text-white ${alignClass}`}>{row.name}</TableCell>
                      <TableCell className={`px-3 ${alignClass}`}>
                        <div className="inline-flex items-center gap-2 rounded-md bg-[#3a3a31] px-2.5 py-1 text-xs font-semibold text-primary">
                          {row.code}
                          {row.code !== "--" ? (
                            <button
                              type="button"
                              onClick={() => onCopyCode(row.code)}
                              className="text-white/45 hover:text-white"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className={`px-3 text-sm text-white ${alignClass}`}>{row.referrals.toLocaleString(numberLocale)}</TableCell>
                      <TableCell className={`px-3 text-sm font-semibold text-primary ${alignClass}`}>
                        ${row.earnings.toLocaleString(numberLocale)}
                      </TableCell>
                      <TableCell className={`px-3 ${alignClass}`}>
                        <span className="inline-flex items-center rounded-full bg-[#4a4725] px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {row.rate}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableCell colSpan={6} className="px-3 py-6 text-center text-sm text-white/60">
                      {isArabic ? "لا يوجد محيلون حالياً" : "No top referrers found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
