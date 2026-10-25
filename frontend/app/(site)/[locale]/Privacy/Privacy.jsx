"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";

export default function Privacy() {
  const { locale } = useTranslations();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const align = locale === "ar" ? "text-right" : "text-left";
  const updated = new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const glowVar = {
    animate: {
      y: [0, -8, 0],
      scale: [1, 1.05, 1],
      opacity: [0.18, 0.28, 0.18],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const containerVar = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.12 },
    },
  };

  const itemVar = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  const content =
    locale === "ar"
      ? [
          {
            t: "سياسة الخصوصية",
            b: "نحن نحترم خصوصيتك. توضح هذه السياسة أنواع البيانات التي نجمعها وكيفية استخدامها وحمايتها.",
          },
          {
            t: "البيانات التي نجمعها",
            b: "قد نجمع معلومات الحساب (مثل البريد الإلكتروني)، وبيانات الاستخدام، ومعلومات الجهاز لأغراض أمنية وتحليلية وتحسين الخدمات.",
          },
          {
            t: "كيفية استخدام البيانات",
            b: "نستخدم البيانات لتقديم الخدمات، وتحسين الأداء، وضمان الأمان، والتواصل حول التحديثات، والامتثال للمتطلبات القانونية.",
          },
          {
            t: "ملفات تعريف الارتباط",
            b: "نستخدم ملفات تعريف الارتباط لتحسين التجربة وتخصيص المحتوى وقياس الأداء. يمكنك إدارة إعدادات ملفات تعريف الارتباط من خلال المتصفح.",
          },
          {
            t: "حقوقك",
            b: "يمكنك طلب الوصول إلى بياناتك، أو تصحيحها، أو حذفها حيثما ينطبق ذلك. لممارسة الحقوق، تواصل معنا عبر البريد الإلكتروني.",
          },
          {
            t: "التواصل",
            b: "لأي استفسار متعلق بالخصوصية، راسلنا على: support@etg-ride.com",
          },
        ]
      : [
          {
            t: "Privacy Policy",
            b: "We value your privacy. This policy explains what data we collect, how we use it, and how we protect it.",
          },
          {
            t: "Data We Collect",
            b: "We may collect account information (such as email), usage data, and device information for security, analytics, and service improvement.",
          },
          {
            t: "How We Use Data",
            b: "We use data to provide services, improve performance, ensure security, communicate updates, and comply with legal requirements.",
          },
          {
            t: "Cookies",
            b: "We use cookies to enhance experience, personalize content, and measure performance. You can manage cookie settings via your browser.",
          },
          {
            t: "Your Rights",
            b: "You can request access to, correction of, or deletion of your data where applicable. To exercise rights, contact us via email.",
          },
          {
            t: "Contact",
            b: "For any privacy-related inquiries, contact: support@etg-ride.com",
          },
        ];

  return (
    <section
      dir={dir}
      className="w-full min-h-screen bg-black relative overflow-hidden px-6 py-16"
    >
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-24 left-0 right-0 h-48 bg-gradient-to-b from-yellow-500/10 to-transparent"
          variants={glowVar}
          animate="animate"
        />
        <motion.div
          className="absolute -bottom-16 ltr:-left-20 rtl:-right-20 w-64 h-64 bg-primary/10 blur-3xl rounded-full"
          variants={glowVar}
          animate="animate"
        />
        <motion.div
          className="absolute -bottom-20 ltr:-right-16 rtl:-left-16 w-56 h-56 bg-primary/10 blur-3xl rounded-full"
          variants={glowVar}
          animate="animate"
        />
      </div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVar}
      >
        <motion.div variants={itemVar} className={`mb-8 ${align}`}>
          <h1 className="text-4xl font-bold text-white">
            {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {locale === "ar" ? "آخر تحديث: " : "Last updated: "}
            {updated}
          </p>
        </motion.div>

        <div className="space-y-4">
          {content.map((s, i) => (
            <motion.div
              key={i}
              id={
                (locale === "en" && s.t === "Cookies") ||
                (locale === "ar" && s.t.includes("ط§ظ„ط§ط±طھط¨ط§ط·"))
                  ? "cookies"
                  : undefined
              }
              variants={itemVar}
              className="bg-[#0b0e11] border border-gray-600/40 rounded-2xl p-4"
            >
              <div className={`text-white text-lg font-semibold ${align}`}>
                {s.t}
              </div>
              <div
                className={`mt-1 text-xs text-gray-400 leading-relaxed ${align}`}
              >
                {s.b}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVar}
          className={`mt-8 flex ${locale === "ar" ? "justify-start" : "justify-end"}`}
        >
          <Link
            href={`/${locale}`}
            className="inline-flex items-center rounded-full bg-primary text-black px-4 py-2 text-sm"
          >
            {locale === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
