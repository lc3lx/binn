"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  const { locale } = useTranslations();
  const isAr = locale === "ar";
  const align = isAr ? "text-right" : "text-left";

  const faqs = [
    {
      q: isAr
        ? "ما هي منصة ETG RIDE وكيف تعمل؟"
        : "What is ETG RIDE and how does it work?",
      a: isAr
        ? "ETG RIDE هي منصة ذكية لتشغيل واستثمار أساطيل السكوترات الكهربائية (Smart E-Scooters). تتيح للمستخدمين استئجار طرازات السكوتر (من E1 إلى E6) وتشغيلها يومياً بنقرة واحدة لتحقيق عوائد أرباح يومية مؤكدة بالـ USDT مباشرة إلى محفظتهم."
        : "ETG RIDE is a smart micro-mobility investment platform. Members lease smart electric scooters (E1 through E6) and power daily dispatches with a single click to generate consistent daily USDT returns credited to their wallets.",
    },
    {
      q: isAr
        ? "كيف أستأجر سكوتر كهربائي وأبدأ الكسب؟"
        : "How do I lease an e-scooter and start earning?",
      a: isAr
        ? "قم بإنشاء حسابك، واشحن رصيدك بالـ USDT عبر شبكة BEP-20، ثم توجه لقسم (طاقة) واختر طراز السكوتر المناسب لميزانيتك واضغط (تأكيد الاستئجار). ستظهر أجهزتك فوراً في شاشة RIDE لتشغيلها."
        : "Register your account, deposit USDT via BEP-20, then visit the (Energy) fleet section to choose your scooter model and confirm lease. Your devices immediately activate in your RIDE console.",
    },
    {
      q: isAr
        ? "كيف يعمل زر الطاقة (⏻) والعد التنازلي في شاشة RIDE؟"
        : "How does the Power button (⏻) and countdown timer work in RIDE?",
      a: isAr
        ? "في شاشة RIDE، اضغط على زر الطاقة الأزرق (⏻) لبدء جولة العمل. ستتحول حالة السكوتر إلى PROGRESS ويبدأ العداد التنازلي الذكي 04:59:50. عند اكتمال الجولة أو جاهزية العائد، يمكنك الضغط على زر الجمع الماروني ($) لتحويل الأرباح مباشرة إلى رصيدك."
        : "In the RIDE screen, press the Blue Power button (⏻) to start the ride cycle. Scooter status changes to PROGRESS and the live 04:59:50 timer activates. Press the maroon ($) button or One-Click Collect to claim earnings to your wallet balance.",
    },
    {
      q: isAr
        ? "ما هو نظام مكافأة الـ 100$ لكل 10 أعضاء؟"
        : "What is the $100 referral reward for every 10 members?",
      a: isAr
        ? "لكل مستخدم كود ورابط إحالة خاص به. عندما يقوم 10 أشخاص بالتسجيل من خلال رابطك وشحن رصيدهم، تمنحك المنصة مكافأة 100 USDT فورية قابلة للسحب، وتتكرر هذه المكافأة بلا حدود مع كل 10 أعضاء جدد."
        : "Each member receives a unique referral link. Whenever 10 referred members register and fund their account, you automatically receive a $100 USDT cash reward, recurring with every additional 10 active referrals without limit.",
    },
    {
      q: isAr
        ? "ما هي الشبكة المدعومة للإيداع والسحب والحد الأدنى؟"
        : "Which network is supported for deposits/withdrawals and what is the minimum?",
      a: isAr
        ? "تدعم المنصة عملة USDT عبر شبكة BNB Smart Chain (BEP-20) مع تأكيد آلي فوري. الحد الأدنى للسحب هو 10 USDT فقط ويتم تحويله مباشرة إلى محفظتك الخاصة في دقائق معدودة."
        : "We exclusively support USDT via BNB Smart Chain (BEP-20) for instant automated processing and ultra-low fees. The minimum withdrawal is just 10 USDT, sent directly to your wallet in minutes.",
    },
  ];

  return (
    <section id="faq" className="w-full py-16 sm:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isAr
              ? "كل ما تحتاج معرفته عن ETG RIDE"
              : "Everything You Need to Know About ETG Ride"}
          </h2>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl px-6 py-2 shadow-xl data-[state=open]:border-cyan-500/40"
            >
              <AccordionTrigger className={`text-base sm:text-lg font-bold text-white hover:text-cyan-400 transition-colors ${align}`}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className={`text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 pb-4 ${align}`}>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
