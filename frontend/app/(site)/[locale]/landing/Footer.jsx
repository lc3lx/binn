"use client";

import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { Mail, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const { locale } = useTranslations();
  const isAr = locale === "ar";
  const align = isAr ? "text-right" : "text-left";
  const year = new Date().getFullYear();
  const base = `/${locale}`;

  return (
    <footer className="w-full bg-[#050811] border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand info */}
          <div className={`space-y-4 md:col-span-1 ${align}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
                ETG RIDE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              {isAr
                ? "المنصة الرائدة لتأجير وتشغيل أساطيل السكوترات الكهربائية الذكية. عوائد يومية مؤكدة وسحب فوري BEP-20."
                : "Next-gen smart electric scooter fleet leasing platform. Consistent daily yields and instant BEP-20 payouts."}
            </p>
          </div>

          {/* Quick links */}
          <div className={`space-y-3 ${align}`}>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              {isAr ? "روابط سريعة" : "Quick Links"}
            </h4>
            <div className="flex flex-col space-y-2 text-xs text-slate-400">
              <a href="#scooter-plans" className="hover:text-cyan-400 transition-colors">
                {isAr ? "أسطول السكوترات (طاقة)" : "Scooter Fleet (Energy)"}
              </a>
              <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                {isAr ? "كيف تعمل المنصة" : "How It Works"}
              </a>
              <a href="#stats" className="hover:text-cyan-400 transition-colors">
                {isAr ? "المزايا والأداء" : "Features & Stats"}
              </a>
              <a href="#faq" className="hover:text-cyan-400 transition-colors">
                {isAr ? "الأسئلة الشائعة" : "FAQ"}
              </a>
            </div>
          </div>

          {/* Platform console */}
          <div className={`space-y-3 ${align}`}>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              {isAr ? "لوحة المنصة" : "Platform Hub"}
            </h4>
            <div className="flex flex-col space-y-2 text-xs text-slate-400">
              <Link href={`${base}/user_dashboard/tasks`} className="hover:text-cyan-400 transition-colors">
                {isAr ? "شاشة تشغيل RIDE" : "RIDE Console"}
              </Link>
              <Link href={`${base}/user_dashboard/mining_plans`} className="hover:text-cyan-400 transition-colors">
                {isAr ? "طاقة (تأجير سكوتر)" : "Energy (Lease Models)"}
              </Link>
              <Link href={`${base}/user_dashboard/Referral`} className="hover:text-cyan-400 transition-colors">
                {isAr ? "مكافآت الإحالة (100$)" : "Referral Rewards ($100)"}
              </Link>
              <Link href={`${base}/user_dashboard/deposit`} className="hover:text-cyan-400 transition-colors">
                {isAr ? "شحن المحفظة BEP-20" : "Deposit BEP-20"}
              </Link>
            </div>
          </div>

          {/* Security & Smart Contracts */}
          <div className={`space-y-3 ${align}`}>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              {isAr ? "الأمان والشبكة" : "Security & Network"}
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>BNB Smart Chain (BEP-20)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isAr
                  ? "جميع المعاملات المالية مؤمنة بنظام العقود الذكية والتأكيد اللحظي على البلوكشين."
                  : "All transactions are secured by automated on-chain verification."}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {year} ETG RIDE. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href={`${base}/Privacy`} className="hover:text-slate-400 transition-colors">
              {isAr ? "سياسة الخصوصية والشروط" : "Privacy Policy & Terms"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
