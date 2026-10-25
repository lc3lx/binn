"use client";

import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import {
  Zap,
  Power,
  ShieldCheck,
  Users,
  Award,
  ArrowUpRight,
  Sparkles,
  Navigation,
  Clock,
  Radio,
} from "lucide-react";

export default function Statistics() {
  const { t, locale } = useTranslations();
  const isAr = locale === "ar";
  const align = isAr ? "text-right" : "text-left";

  const features = [
    {
      id: "fleet",
      title: isAr ? "أسطول سكوترات ذكي (E1 إلى E6)" : "Smart E-Scooter Fleet (E1 - E6)",
      desc: isAr
        ? "سكوترات كهربائية متطورة متصلة بإنترنت الأشياء (IoT) ومزودة بنظام تتبع GPS دقيق لتوليد عوائد مستقرة."
        : "Next-gen electric scooters connected via IoT and GPS telematics delivering reliable daily yields.",
      icon: Zap,
      badge: isAr ? "تقنية ذكية" : "Smart Tech",
      color: "from-blue-600/20 to-cyan-500/20",
      border: "border-blue-500/30",
      iconColor: "text-cyan-400",
    },
    {
      id: "power",
      title: isAr ? "تشغيل بنقرة واحدة (⏻) وعد تنازلي" : "One-Click Power (⏻) & Timer",
      desc: isAr
        ? "اضغط زر الطاقة لتفعيل دورة الرحلة اليومية 04:59:50 واستلام أرباحك بالـ USDT بنقرة واحدة."
        : "Power up your active scooter with a single click, track real-time cycle countdowns, and claim USDT earnings.",
      icon: Power,
      badge: isAr ? "تحكم فوري" : "Instant Control",
      color: "from-cyan-600/20 to-blue-500/20",
      border: "border-cyan-500/30",
      iconColor: "text-blue-400",
    },
    {
      id: "referral",
      title: isAr ? "مكافأة 100$ لكل 10 أعضاء" : "$100 Reward Per 10 Referrals",
      desc: isAr
        ? "شارك كود إحالتك واكسب 100 USDT قابلة للسحب الفوري مع كل 10 أعضاء يسجلون ويشحنون من خلالك بلا حدود."
        : "Share your invite code and earn an instant $100 withdrawable USDT reward for every 10 active referrals.",
      icon: Award,
      badge: isAr ? "مكافأة فورية" : "Instant Cash",
      color: "from-amber-600/20 to-yellow-500/20",
      border: "border-amber-500/30",
      iconColor: "text-amber-400",
    },
    {
      id: "security",
      title: isAr ? "سحب وإيداع فوري BEP-20" : "Instant BEP-20 Deposits & Payouts",
      desc: isAr
        ? "تأكيدات آلية فورية للإيداع وسحب أرباحك بضغطة زر إلى محفظتك الخاصة دون أي تأخير أو رسوم مخفية."
        : "Automated instant blockchain verification and 24/7 direct withdrawals to your BEP-20 crypto wallet.",
      icon: ShieldCheck,
      badge: isAr ? "أمان مشفر" : "Military Grade",
      color: "from-emerald-600/20 to-teal-500/20",
      border: "border-emerald-500/30",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <section id="stats" className="w-full py-16 sm:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{isAr ? "مزايا منصة ETG RIDE" : "ETG Ride Advantages"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {isAr
              ? "لماذا تختار الاستثمار في أسطول ETG Ride؟"
              : "Why Choose ETG Ride Smart Fleet Investment?"}
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            {isAr
              ? "نجمع بين أحدث تقنيات التنقل الصديقة للبيئة والذكاء الاصطناعي لتقديم أعلى عوائد أرباح يومية مؤكدة."
              : "Combining eco-friendly micro-mobility infrastructure with automated smart contracts for verified daily returns."}
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`relative overflow-hidden rounded-3xl bg-slate-900/80 border ${item.border} backdrop-blur-2xl p-6 shadow-2xl flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300`}
            >
              {/* Subtle card glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none`}
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center ${item.iconColor} shadow-inner`}
                  >
                    <item.icon className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-slate-300">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Bottom decorative bar */}
              <div className="relative z-10 pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>{isAr ? "نظام أوتوماتيكي" : "Automated"}</span>
                <span className="text-cyan-400">24/7 Live</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
