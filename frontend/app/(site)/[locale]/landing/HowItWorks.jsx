"use client";

import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { Wallet, Zap, Power, DollarSign, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const { locale } = useTranslations();
  const isAr = locale === "ar";

  const steps = [
    {
      num: "01",
      title: isAr ? "إنشاء الحساب وشحن الرصيد" : "Register & Deposit USDT",
      desc: isAr
        ? "سجل حسابك في ثوانٍ واشحن محفظتك بعملة USDT عبر شبكة BEP-20 مع تأكيد فوري ومعالجة آلية."
        : "Create your account and deposit USDT via BEP-20 with instant automated verification.",
      icon: Wallet,
      color: "from-blue-500 to-cyan-500",
    },
    {
      num: "02",
      title: isAr ? "استئجار طراز السكوتر (طاقة)" : "Lease Scooter Model (Energy)",
      desc: isAr
        ? "اختر طراز السكوتر الكهربائي المناسب من E1 حتى E6، ليتم تفعيل أجهزتك فوراً في لوحة التحكم."
        : "Select your desired smart scooter tier from E1 to E6 to instantly activate your fleet devices.",
      icon: Zap,
      color: "from-cyan-500 to-teal-400",
    },
    {
      num: "03",
      title: isAr ? "تشغيل الرحلة اليومية (⏻)" : "Power Up Daily Ride (⏻)",
      desc: isAr
        ? "توجه لشاشة RIDE واضغط زر الطاقة الأزرق (⏻) لبدء جولة العمل ومتابعة العد التنازلي للرحلة."
        : "Go to RIDE console, press the Blue Power button (⏻) to start the ride cycle and live timer.",
      icon: Power,
      color: "from-indigo-500 to-blue-600",
    },
    {
      num: "04",
      title: isAr ? "جمع الأرباح والسحب الفوري" : "Collect & Withdraw Earnings",
      desc: isAr
        ? "اضغط زر ($) أو زر (جمع في نقرة واحدة) لتحويل أرباحك لمحفظتك وسحبها فوراً دون قيود."
        : "Click the ($) button or (One-Click Collect) to credit profits and withdraw to your private wallet.",
      icon: DollarSign,
      color: "from-amber-400 to-emerald-400",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-16 sm:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isAr ? "دليل البدء السريع" : "Quick Start Guide"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {isAr
              ? "كيف تبدأ الكسب مع ETG RIDE في 4 خطوات؟"
              : "How to Start Earning with ETG Ride in 4 Steps?"}
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            {isAr
              ? "نظام سلس ومبسط مصمم ليمكنك من بدء تحقيق عوائد يومية من أول دقيقة."
              : "A streamlined, frictionless experience designed to get your smart fleet earning immediately."}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black font-mono text-cyan-500/30">
                  {step.num}
                </span>

                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                  <step.icon className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${step.color}`}
                  style={{ width: `${(idx + 1) * 25}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
