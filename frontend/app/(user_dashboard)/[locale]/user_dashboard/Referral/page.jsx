"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatApiError } from "@/lib/format-error";
import { useTranslations } from "@/hooks/useTranslations";
import {
  useReferralListQuery,
  useClaimReferralMilestoneMutation,
} from "@/api/services/user/Referral/referral.query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Gift,
  Link as LinkIcon,
  Copy,
  Users,
  TrendingUp,
  Trophy,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Coins,
  Flame,
  Zap,
  Wallet,
  Check,
  ShieldCheck,
} from "lucide-react";

function getStatusKey(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "active") return "active";
  if (normalized === "pending") return "pending";
  return "inactive";
}

export default function ReferralPage() {
  const { t, locale } = useTranslations();
  const isRtl = locale === "ar";
  const [copied, setCopied] = useState(false);

  const { data: response, isLoading, isError } = useReferralListQuery();

  const claimMutation = useClaimReferralMilestoneMutation({
    onSuccess: (data) => {
      toast.success(
        data?.message ||
          (locale === "ar"
            ? "تم استلام المكافأة بنجاح وإضافتها إلى رصيدك المتاح للسحب!"
            : "Reward claimed successfully and added to your withdrawable balance!"),
      );
    },
    onError: (err) => {
      toast.error(formatApiError(err, locale));
    },
  });

  const payload = response?.data || {};
  const currency = payload?.currency || "USD";
  const referralCode = payload?.referralCode || "";
  const settingsSnapshot = payload?.settingsSnapshot || {};
  const milestones = payload?.milestones || {
    rewardPerMilestone: 100,
    referralsPerMilestone: 10,
    qualifiedDepositingCount: 0,
    totalEarnedMilestones: 0,
    claimedMilestones: 0,
    unclaimedMilestones: 0,
    unclaimedRewardAmount: 0,
    totalClaimedRewardAmount: 0,
    nextMilestoneTarget: 10,
    referralsNeededForNextReward: 10,
    progressToNextRewardPercent: 0,
    canClaim: false,
    roadmap: [],
  };

  const referralLink = payload?.referralLink || "";

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const totalReferrals = Number(payload?.totalReferrals || 0);
  const totalEarnings = Number(payload?.totalEarnings || 0);
  const currentCommission = Number(payload?.tier?.commissionPercent || 0);
  const activeReferralsForTier = Number(payload?.tier?.activeReferralsForTier || 0);
  const needMore = Number(payload?.tier?.referralsNeededForNext || 0);
  const nextCommission = Number(payload?.tier?.nextTier?.commissionPercent || 0);

  const tierProgress =
    activeReferralsForTier + needMore > 0
      ? Math.min(activeReferralsForTier / (activeReferralsForTier + needMore), 1)
      : 0;

  const recent = Array.isArray(payload?.recentReferrals)
    ? payload.recentReferrals.map((item) => ({
        user: item?.userMasked || "-",
        date: item?.joinedAt
          ? new Date(item.joinedAt).toLocaleDateString(
              locale === "ar" ? "ar-EG" : "en-US",
            )
          : "-",
        status: getStatusKey(item?.status),
        earned: Number(item?.earnedFromUser || 0),
      }))
    : [];

  const onCopy = async () => {
    const valueToCopy = referralLink || referralCode;
    if (!valueToCopy) return;
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      toast.success(
        locale === "ar" ? "تم نسخ الرابط بنجاح" : "Referral link copied",
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const onClaim = () => {
    if (claimMutation.isPending || !milestones?.canClaim) return;
    claimMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 overflow-x-hidden p-4 sm:space-y-6 sm:p-6 text-white/70">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>
            {locale === "ar"
              ? "جاري تحميل بيانات الإحالة والجوائز..."
              : "Loading referral rewards and data..."}
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 overflow-x-hidden p-4 sm:space-y-6 sm:p-6">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {locale === "ar"
            ? "تعذر تحميل بيانات الإحالة"
            : "Failed to load referral data"}
        </div>
      </div>
    );
  }

  const qualifiedCount = milestones.qualifiedDepositingCount || 0;
  const progressPercent = Math.min(
    Math.max(milestones.progressToNextRewardPercent || 0, 0),
    100,
  );
  const neededForNext = milestones.referralsNeededForNextReward ?? 10;
  const currentTenProgress = qualifiedCount % 10;
  const unclaimedAmount = milestones.unclaimedRewardAmount || 0;

  return (
    <div className="space-y-6 overflow-x-hidden p-4 sm:p-6">
      {/* =========================================================================
          1. ANIMATED MILESTONE REWARDS HERO BANNER ($100 per 10 Referrals)
      ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-[#181a20] via-[#1e2329] to-[#121418] p-5 shadow-2xl sm:p-8"
      >
        {/* Glow ambient background elements */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Header & Description */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3.5 py-1 text-xs font-semibold text-yellow-400">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: "3s" }} />
              <span>{t("referral.milestones.rewardPerTen")}</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
              {t("referral.milestones.title")}
            </h1>

            <p className="text-sm leading-relaxed text-white/80 sm:text-base">
              {t("referral.milestones.subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/90">
                <Users size={16} className="text-yellow-400" />
                <span>
                  {t("referral.milestones.qualifiedCount")}:{" "}
                  <strong className="text-yellow-400 font-bold">{qualifiedCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/90">
                <Trophy size={16} className="text-primary" />
                <span>
                  {locale === "ar" ? "المكافآت المكتسبة:" : "Earned Rewards:"}{" "}
                  <strong className="text-primary font-bold">
                    ${milestones.totalEarnedMilestones * 100}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Golden Trophy Animation Graphic */}
          <motion.div
            animate={{
              y: [0, -6, 0],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }}
            className="flex shrink-0 items-center justify-center self-center lg:self-auto"
          >
            <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-yellow-500/40 bg-gradient-to-tr from-yellow-500/20 via-yellow-400/10 to-transparent p-4 shadow-[0_0_40px_rgba(240,185,11,0.2)] sm:h-36 sm:w-36">
              <Trophy className="h-16 w-16 text-yellow-400 sm:h-20 sm:w-20 drop-shadow-[0_0_15px_rgba(240,185,11,0.5)]" />
              <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-black shadow-lg">
                $100
              </div>
            </div>
          </motion.div>
        </div>

        {/* Claim / Unclaimed Box (if rewards ready) */}
        <AnimatePresence>
          {milestones?.canClaim && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6 rounded-xl border-2 border-yellow-400/80 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/10 p-4 sm:p-6 shadow-[0_0_30px_rgba(240,185,11,0.25)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black shadow-md">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-yellow-400 sm:text-lg">
                      {t("referral.milestones.unclaimedTitle")}
                    </h3>
                    <p className="text-xs text-white/85 sm:text-sm">
                      {t("referral.milestones.unclaimedDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    onClick={onClaim}
                    disabled={claimMutation.isPending}
                    className="h-11 bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 font-bold text-black shadow-lg hover:from-yellow-300 hover:to-yellow-400"
                  >
                    {claimMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        <span>{t("referral.milestones.claiming")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Trophy size={18} />
                        <span>
                          {t("referral.milestones.claimBtn", {
                            amount: unclaimedAmount,
                          })}
                        </span>
                      </div>
                    )}
                  </Button>

                  <Link href={`/${locale}/user_dashboard/Withdraw`}>
                    <Button
                      variant="outline"
                      className="h-11 w-full border-yellow-400/50 bg-black/40 text-yellow-400 hover:bg-yellow-400/10 sm:w-auto"
                    >
                      <Wallet className="mr-2" size={16} />
                      {t("referral.milestones.withdrawBtn")}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Towards Next 100$ Reward */}
        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Flame className="text-yellow-400" size={18} />
              <span className="text-sm font-semibold text-white">
                {t("referral.milestones.progressTitle")}
              </span>
            </div>
            <div className="text-xs font-medium text-yellow-400">
              {currentTenProgress} / 10{" "}
              {locale === "ar" ? "أعضاء شاحنين" : "depositing members"} ({progressPercent}%)
            </div>
          </div>

          {/* Customized Animated Progress Bar */}
          <div className="relative mt-3 h-3.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(240,185,11,0.6)]"
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-white/70">
            <span>
              {t("referral.milestones.progressSubtitle", {
                needed: neededForNext,
              })}
            </span>
            <Link
              href={`/${locale}/user_dashboard/Withdraw`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Wallet size={13} />
              <span>{t("referral.milestones.withdrawBtn")}</span>
              {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          2. MILESTONE ROADMAP CARDS (Tiers: 10, 20, 30, 40, 50...)
      ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} />
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {t("referral.milestones.roadmapTitle")}
            </h2>
          </div>
          <span className="text-xs text-white/60">
            {locale === "ar" ? "مكافآت غير محدودة" : "Unlimited Rewards"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {(milestones.roadmap || []).map((tier, idx) => {
            const isClaimed = tier.status === "claimed";
            const isReady = tier.status === "ready";
            const isInProgress = tier.status === "in_progress";
            const isLocked = tier.status === "locked";

            let borderClass = "border-white/10 bg-sidebar/80";
            if (isClaimed) {
              borderClass = "border-green-500/40 bg-green-500/5";
            } else if (isReady) {
              borderClass =
                "border-yellow-400 bg-yellow-500/10 shadow-[0_0_20px_rgba(240,185,11,0.2)]";
            } else if (isInProgress) {
              borderClass = "border-primary/40 bg-primary/5";
            }

            return (
              <motion.div
                key={tier.target}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 transition-all ${borderClass}`}
              >
                {/* Header of Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/60">
                      {t("referral.milestones.tierCard", { index: idx + 1 })}
                    </span>
                    {isClaimed && (
                      <CheckCircle2 size={16} className="text-green-400" />
                    )}
                    {isReady && (
                      <Sparkles size={16} className="animate-spin text-yellow-400" style={{ animationDuration: "3s" }} />
                    )}
                    {isInProgress && (
                      <Flame size={16} className="text-primary" />
                    )}
                    {isLocked && (
                      <Lock size={14} className="text-white/40" />
                    )}
                  </div>

                  <div className="text-base font-bold text-white">
                    {t("referral.milestones.tierGoal", {
                      target: tier.target,
                    })}
                  </div>

                  <div className="text-sm font-semibold text-yellow-400">
                    {t("referral.milestones.tierReward", {
                      total: tier.target * 10,
                    })}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  {isClaimed && (
                    <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/15 py-1.5 text-xs font-medium text-green-400">
                      <Check size={14} />
                      <span>{t("referral.milestones.statusClaimed")}</span>
                    </div>
                  )}

                  {isReady && (
                    <button
                      onClick={onClaim}
                      disabled={claimMutation.isPending}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-yellow-400 bg-yellow-400 py-1.5 text-xs font-bold text-black shadow-md hover:bg-yellow-300"
                    >
                      <span>{t("referral.milestones.statusReady")}</span>
                    </button>
                  )}

                  {isInProgress && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-primary font-medium">
                        <span>{t("referral.milestones.statusInProgress", {
                          count: qualifiedCount,
                          target: tier.target,
                        })}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(100, (qualifiedCount / tier.target) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-medium text-white/40">
                      <Lock size={12} />
                      <span>{t("referral.milestones.statusLocked")}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. HOW IT WORKS & QUALIFICATION RULES
      ========================================================================= */}
      <Card className="border-gray-400/20 bg-sidebar text-white">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
            <ShieldCheck className="text-yellow-400" size={20} />
            <span>{t("referral.milestones.rulesTitle")}</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
                <LinkIcon size={16} />
                <span>{t("referral.milestones.rule1Title")}</span>
              </div>
              <p className="text-xs leading-relaxed text-white/70">
                {t("referral.milestones.rule1Desc")}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Coins size={16} />
                <span>{t("referral.milestones.rule2Title")}</span>
              </div>
              <p className="text-xs leading-relaxed text-white/70">
                {t("referral.milestones.rule2Desc")}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                <Wallet size={16} />
                <span>{t("referral.milestones.rule3Title")}</span>
              </div>
              <p className="text-xs leading-relaxed text-white/70">
                {t("referral.milestones.rule3Desc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================================================
          4. REFERRAL LINK & CODE SHARING CARD
      ========================================================================= */}
      <Card className="border-gray-400/40 bg-sidebar text-white">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Gift className="text-yellow-400" />
            <span>{t("referral.title")}</span>
          </div>

          <p className="text-sm text-white/80">{t("referral.subtitle")}</p>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-gray-400/40 bg-black/40 px-3 py-2">
              <LinkIcon className="shrink-0 text-white/70" size={18} />
              <Input
                readOnly
                value={referralLink || referralCode || ""}
                className="min-w-0 border-0 bg-transparent px-0 text-xs text-white sm:text-sm"
              />
            </div>
            <Button
              onClick={onCopy}
              className="w-full sm:w-auto"
              disabled={!referralLink && !referralCode}
            >
              <Copy className="mr-2" size={16} />
              {copied ? t("referral.copied") : t("referral.copy")}
            </Button>
          </div>

          {!payload?.referralLink && payload?.referralLinkHint ? (
            <p className="text-xs text-amber-300/90">{payload.referralLinkHint}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-primary font-mono">
              Code: {referralCode || "-"}
            </span>
            <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/80">
              L2: {Number(settingsSnapshot?.level2CommissionPercent || 0)}%
            </span>
            <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/80">
              Min plans: {Number(settingsSnapshot?.referralActiveMinPlans || 0)}
            </span>
            <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/80">
              Min withdrawal: {Number(settingsSnapshot?.minimumWithdrawal || 0)}{" "}
              {currency}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* =========================================================================
          5. OVERALL STATS & TIER COMMISSION PROGRESS
      ========================================================================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <Card>
          <CardContent className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Users
                size={42}
                className="rounded-full bg-secondary/10 p-2 text-primary"
              />
              <div>
                <div className="text-sm text-white">
                  {t("referral.stats.totalReferrals")}
                </div>
                <div className="text-2xl font-bold text-white">
                  {totalReferrals}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <TrendingUp
                size={42}
                className="rounded-full bg-success/10 p-2 text-primary"
              />
              <div>
                <div className="text-sm text-white">
                  {t("referral.stats.totalEarnings")}
                </div>
                <div className="text-2xl font-bold text-white">
                  {nf.format(totalEarnings)} {currency}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-white">
              {t("referral.reward.current")}
            </div>
            <div className="w-fit rounded bg-primary/10 p-3 text-xs font-semibold text-primary">
              {payload?.tier?.name || "-"}
            </div>
          </div>

          <div className="text-sm text-white">
            {currentCommission}% {t("referral.reward.commission")}
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.round(tierProgress * 100)}%` }}
            />
          </div>

          <div className="text-sm text-white">
            {nextCommission > 0 ? (
              <>
                {t("referral.reward.nextTier")}: {nextCommission}% - {needMore}{" "}
                {t("referral.reward.needMore")}
              </>
            ) : locale === "ar" ? (
              "لا يوجد مستوى أعلى حاليًا"
            ) : (
              "No higher tier currently"
            )}
          </div>
        </CardContent>
      </Card>

      {/* =========================================================================
          6. RECENT REFERRALS TABLE
      ========================================================================= */}
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="text-lg font-semibold text-white">
            {t("referral.recent.title")}
          </div>

          <div className="space-y-3 sm:hidden">
            {recent.map((r, i) => (
              <div
                key={`mobile-${i}`}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="text-sm font-medium text-white">{r.user}</div>
                <div className="mt-2 text-xs text-white/45">{r.date}</div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      r.status === "active"
                        ? "bg-green-100 text-green-700"
                        : r.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {t(`referral.status.${r.status}`)}
                  </span>
                  <span className="text-sm font-medium text-green-700">
                    +{nf.format(r.earned)} {currency}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden max-w-full overflow-x-auto sm:block">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">
                    {t("referral.table.user")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("referral.table.dateJoined")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("referral.table.status")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("referral.table.earned")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-3 py-2 text-center">
                      {r.user}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {r.date}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          r.status === "active"
                            ? "bg-green-500/15 text-green-400"
                            : r.status === "pending"
                              ? "bg-yellow-500/15 text-yellow-300"
                              : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {t(`referral.status.${r.status}`)}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center font-medium text-primary">
                      +{nf.format(r.earned)} {currency}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
