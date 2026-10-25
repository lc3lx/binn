"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Users, Award, Gift, ArrowUpRight, Sparkles, Check } from "lucide-react";

export default function ReferralRewardBanner() {
  const { locale } = useTranslations();
  const { canAccessUserDashboard } = useAuth();
  const isAr = locale === "ar";
  const base = `/${locale}`;

  return (
    <section className="w-full py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-amber-500/40 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
          {/* Decorative ambient light */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-right">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>
                  {isAr ? "مكافأة الشراكة الحصرية" : "Exclusive Partnership Milestone"}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {isAr ? (
                  <>
                    اربح <span className="text-amber-400">100 دولار</span> مع كل 10 أعضاء نشطين!
                  </>
                ) : (
                  <>
                    Earn <span className="text-amber-400">$100 USDT</span> For Every 10 Active Members!
                  </>
                )}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {isAr
                  ? "شارك رابط وكود الإحالة الخاص بك مع أصدقائك ومجتمعك. بمجرد تسجيل 10 أشخاص وشحن رصيدهم، ستحصل تلقائياً على مكافأة 100 USDT فورية قابلة للسحب، بلا حدود وتتكرر مع كل 10 إحالات جديدة!"
                  : "Share your referral link with your network. Whenever 10 referrals sign up and deposit, you immediately unlock an instant $100 USDT reward, claimable with zero caps!"}
              </p>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href={
                  canAccessUserDashboard
                    ? `${base}/user_dashboard/Referral`
                    : `${base}/user_auth/signup`
                }
              >
                <Button className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 active:scale-95 transition-all">
                  <Award className="w-5 h-5 mr-2" />
                  <span>{isAr ? "احصل على كود الإحالة الخاص بك" : "Get Your Referral Code"}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
