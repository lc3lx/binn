"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Image from "next/image";
import { useFaqListQuery } from "@/api/services/admin/faq/faq.query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  const { t, locale } = useTranslations();
  const isAr = locale === "ar";
  const align = isAr ? "text-right" : "text-left";

  const { data: faqResponse } = useFaqListQuery();

  const [open, setOpen] = useState("");

  // Default bilingual FAQs in case DB is loading or empty
  const defaultFaqs = useMemo(
    () => [
      {
        q: isAr
          ? "كيف أبدأ التعدين في منصة Binance Mining؟"
          : "How do I start mining on Binance Mining?",
        a: isAr
          ? "قم بإنشاء حساب جديد، وتأكيد هويتك، ثم قم بإيداع رصيد USDT عبر شبكة BEP-20، واختر خطة التعدين المناسبة لتبدأ أرباحك بالنزول يومياً."
          : "Simply create an account, complete your basic KYC verification, deposit USDT (BEP-20) to your allocated wallet address, and choose your preferred mining plan to start earning daily profits.",
      },
      {
        q: isAr
          ? "ما هي الشبكات المدعومة للإيداع والسحب؟"
          : "Which deposit networks are supported?",
        a: isAr
          ? "المنصة تدعم عملة USDT عبر شبكة BNB Smart Chain (BEP-20) لضمان سرعة المعاملات ورسوم تحويل شبه معدومة وتأكيدات آلية فورية."
          : "We support USDT exclusively over the BNB Smart Chain (BEP-20) network, ensuring instant confirmations and near-zero network fees.",
      },
      {
        q: isAr
          ? "متى وكيف يتم توزيع أرباح التعدين؟"
          : "When and how are mining profits distributed?",
        a: isAr
          ? "تُحسب وتُوزع أرباح التعدين بشكل آلي تماماً كل 24 ساعة مباشرة إلى رصيد محفظتك، ويمكنك سحب أرباحك أو إعادة استثمارها في أي وقت."
          : "Mining profits are calculated automatically and credited directly to your account wallet balance on a daily basis (every 24 hours). You can withdraw or reinvest at any time.",
      },
      {
        q: isAr
          ? "ما هو الحد الأدنى للسحب وكم يستغرق؟"
          : "What is the minimum withdrawal limit and how long does it take?",
        a: isAr
          ? "الحد الأدنى للسحب هو 10 USDT فقط، وتتم مراجعة ومعالجة طلبات السحب بأمان وسرعة عالية."
          : "The minimum withdrawal is 10 USDT. Withdrawal requests are processed securely, typically within minutes to a few hours.",
      },
      {
        q: isAr
          ? "كيف يعمل نظام عمولات الإحالة والشركاء؟"
          : "How does the Referral & Affiliate program work?",
        a: isAr
          ? "يمكنك مشاركة رابط إحالتك مع أصدقائك، وستحصل على عمولات يومية مجزية (10% إلى 20% للمستوى الأول و 5% للمستوى الثاني) تضاف لرصيدك مباشرة من عوائد تعدين فريقك."
          : "Share your unique referral link with friends. When they subscribe to mining plans, you receive multi-tier commissions (10%-20% for Level 1, 5% for Level 2) credited daily.",
      },
    ],
    [isAr],
  );

  // Transform API data to accordion items with automatic fallback
  const faqItems = useMemo(() => {
    if (faqResponse?.data && Array.isArray(faqResponse.data)) {
      const activeFromApi = faqResponse.data
        .filter((item) => item.isActive)
        .map((item) => ({
          q: item.question,
          a: item.answer,
        }));

      if (activeFromApi.length > 0) {
        return activeFromApi;
      }
    }
    return defaultFaqs;
  }, [faqResponse, defaultFaqs]);

  return (
    <section
      id="how-it-works"
      dir={isAr ? "rtl" : "ltr"}
      className="relative w-full overflow-hidden py-16"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute bottom-8 ltr:-left-16 rtl:-right-16 w-80 h-80">
          <Image
            src="/left.png"
            alt="left coin"
            fill
            className="object-contain opacity-40"
          />
        </div>
        <div className="absolute bottom-36 ltr:-right-16 rtl:-left-16 w-80 h-80">
          <Image
            src="/right.png"
            alt="right coin"
            fill
            className="object-contain opacity-40"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{isAr ? "إجابات لجميع استفساراتك" : "Frequently Asked Questions"}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            {t("faq.title") || (isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions")}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {t("faq.subtitle") || (isAr ? "إليك أهم الأسئلة والإجابات حول منصة التعدين وآلية عملها" : "Find quick answers to common questions about mining and profits")}
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          value={open}
          onValueChange={setOpen}
          className="mx-auto w-full space-y-3"
        >
          {faqItems.map((it, i) => {
            const value = `faq-${i}`;

            return (
              <AccordionItem
                key={i}
                value={value}
                className="relative rounded-xl border border-white/10 bg-[#121316]/90 backdrop-blur-md overflow-hidden transition hover:border-white/20"
              >
                <div className="px-5">
                  <AccordionTrigger
                    className={`py-4 ${align} text-white hover:no-underline text-sm font-bold hover:text-primary transition`}
                  >
                    {it.q}
                  </AccordionTrigger>
                </div>

                <AccordionContent className="text-xs text-gray-300 leading-relaxed border-t border-white/5 bg-black/30">
                  <div className="px-5 py-4">{it.a}</div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}
