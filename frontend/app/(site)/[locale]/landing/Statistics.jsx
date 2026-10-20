"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export default function Statistics() {
  const { t, locale } = useTranslations();
  const align = locale === "ar" ? "text-right" : "text-left";
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimateHover = !prefersReducedMotion;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.06,
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 16,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.28,
        ease: "easeOut",
      },
    },
  };

  const cardHover = {
    y: -2,
    scale: 1.004,
    borderColor: "rgba(255, 209, 0, 0.35)",
    transition: { duration: 0.07, ease: "linear" },
  };

  return (
    <section
      id="stats"
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="w-full py-16"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="z-50 mb-12 text-center">
          <h2 className="mb-5 text-4xl font-bold text-white">{t("stats.title")}</h2>
          <p className="text-sm text-white">{t("stats.subtitle")}</p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:auto-rows-[190px] xl:grid-cols-3"
        >
          <motion.div
            variants={itemVariants}
            whileHover={shouldAnimateHover ? cardHover : undefined}
            className="relative flex min-h-[230px] flex-col items-start justify-start rounded-2xl border border-gray-600/40 bg-card p-4 sm:min-h-[420px] sm:justify-between xl:row-span-2 xl:min-h-0"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              <div className="absolute -left-20 -top-20 h-64 w-52 rounded-full bg-yellow-500/20 blur-3xl" />
            </div>

            <div
              className={`absolute -top-5 ${
                locale === "ar" ? "-left-1" : "-left-1"
              } hidden h-36 w-28 sm:h-44 sm:w-36 md:block md:h-60 md:w-48`}
            >
              <Image src="/hammer.png" alt="hammer" fill className="object-contain" />
            </div>

            <div className={`pt-0 sm:pt-44 ${align}`}>
              <p className="text-lg font-bold text-white">{t("stats.btc.title")}</p>
              <h3 className="mt-1 text-3xl font-bold text-primary">
                {t("stats.btc.value", { defaultValue: "142.87+" })}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-gray-400">
                {t("stats.btc.desc")}
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={shouldAnimateHover ? cardHover : undefined}
            className="relative flex min-h-[230px] gap-4 rounded-2xl border border-gray-600/40 bg-card p-4 sm:min-h-[190px] xl:min-h-0"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              <div className="absolute -top-10 h-44 w-44 rounded-full bg-primary/10 blur-2xl ltr:-left-10 rtl:-right-10" />
            </div>

            <div
              className={`absolute -top-8 ${
                locale === "ar" ? "left-0 md:-left-14" : "right-0 md:-right-14"
              } z-0 hidden h-24 w-24 shrink-0 pointer-events-none sm:h-32 sm:w-32 md:block md:h-44 md:w-44`}
            >
              <Image src="/roket.png" alt="rocket" fill className="object-contain" />
            </div>

            <div className={`relative z-10 w-full pt-0 sm:w-[62%] ${align}`}>
              <p className="text-lg font-bold text-white">{t("stats.target.title")}</p>
              <h3 className="text-3xl font-bold text-primary">1.50%</h3>
              <p className="mt-2 text-xs text-gray-400">{t("stats.target.desc")}</p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={shouldAnimateHover ? cardHover : undefined}
            className="relative flex min-h-[230px] flex-col items-start justify-start rounded-2xl border border-gray-600/40 bg-card p-4 sm:min-h-[420px] sm:justify-between xl:row-span-2 xl:min-h-0"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              <div className="absolute -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl ltr:-left-10 rtl:-left-10" />
            </div>

            <div className="absolute -right-2 -top-2 hidden h-28 w-28 sm:h-36 sm:w-36 md:block md:h-52 md:w-52">
              <Image src="/users.png" alt="users" fill className="object-contain" />
            </div>

            <div className={`pt-0 sm:pt-48 ${align}`}>
              <p className="text-lg font-bold text-white">{t("stats.miners.title")}</p>
              <h3 className="mt-1 text-3xl font-bold text-primary">2843+</h3>
              <p className="mt-3 text-xs text-gray-400">{t("stats.miners.desc")}</p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={shouldAnimateHover ? cardHover : undefined}
            className="relative min-h-[230px] rounded-2xl border border-gray-600/40 bg-card sm:min-h-[190px] xl:min-h-0"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              <div className="absolute -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl ltr:-left-10 rtl:-right-10" />
            </div>

            <div
              className={`absolute -top-2 ${
                locale === "ar" ? "-left-7 md:-left-10" : "-right-7 md:-right-6.5"
              } z-0 hidden h-24 w-24 shrink-0 pointer-events-none sm:h-28 sm:w-28 md:block md:h-36 md:w-36`}
            >
              <Image
                src="/lightning.png"
                alt="lightning"
                fill
                className="object-contain"
              />
            </div>

            <div className={`relative z-10 w-full p-4 pt-4 sm:w-[72%] ${align}`}>
              <p className="text-lg font-bold text-white">{t("stats.hashrate.title")}</p>
              <h3 className="text-3xl font-bold text-primary">1248 TH/s</h3>
              <p className="mt-2 text-xs text-gray-400">{t("stats.hashrate.desc")}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
