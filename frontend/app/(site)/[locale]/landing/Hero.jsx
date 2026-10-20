"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { ChevronDown, Play, FastForward } from "lucide-react";

function Hero() {
  const { t, locale } = useTranslations();
  const isAr = locale === "ar";
  const [showContent, setShowContent] = useState(false);
  const videoRef = useRef(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        video.currentTime = 0;
        await video.play();
      } catch {
        // Fallback if browser policy delays autoplay
      }
    };

    tryPlay();

    const fallbackTimer = window.setTimeout(() => {
      setShowContent(true);
    }, 14000);

    return () => window.clearTimeout(fallbackTimer);
  }, []);

  const handleSkipVideo = () => {
    setShowContent(true);
  };

  return (
    <>
      <section
        className={`relative flex sm:h-screen w-full items-center justify-center overflow-hidden bg-black ${
          showContent ? "pt-18" : "pt-0"
        }`}
      >
        <Image
          src="/yallow.svg"
          alt="logo"
          aria-hidden="true"
          width={300}
          height={300}
          className="pointer-events-none absolute -left-10 -top-16 z-[3] h-[220px] w-[220px] opacity-75 sm:-left-12 sm:-top-20 sm:h-[300px] sm:w-[300px]"
        />

        {/* The 3D Animation Video */}
        <div className="relative h-full w-full pt-16 sm:pt-0">
          <video
            ref={videoRef}
            className="block h-full w-full object-cover object-center"
            muted
            playsInline
            autoPlay
            preload="auto"
            poster="/dashboard.png"
            onEnded={() => setShowContent(true)}
          >
            <source src="/video_2026-03-19_15-36-44.mp4" type="video/mp4" />
          </video>

          {/* Quick Skip Button while video is playing */}
          {!showContent && (
            <button
              onClick={handleSkipVideo}
              type="button"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md hover:bg-black/80 hover:text-primary transition cursor-pointer"
            >
              <span>{isAr ? "تخطي ومتابعة للموقع" : "Skip to Website"}</span>
              <FastForward className="h-3.5 w-3.5 text-primary" />
            </button>
          )}
        </div>

        {/* Content revealed after animation or skip */}
        <AnimatePresence>
          {showContent && (
            <>
              {/* Corner decorative coins */}
              <div className="pointer-events-none absolute inset-0 z-[3]">
                <div className="absolute bottom-8 ltr:-left-8 rtl:-right-8 h-44 w-44 sm:h-80 sm:w-80">
                  <Image
                    src="/left.png"
                    alt="left coin"
                    fill
                    className="object-contain opacity-70"
                  />
                </div>
                <div className="absolute bottom-36 ltr:-right-8 rtl:-left-8 h-44 w-44 sm:h-80 sm:w-80">
                  <Image
                    src="/right.png"
                    alt="right coin"
                    fill
                    className="object-contain opacity-70"
                  />
                </div>
              </div>

              {/* Black backdrop overlay */}
              <motion.div
                className="absolute inset-0 z-[1] bg-black/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />

              {/* Hardware-accelerated soft radial glow (Zero GPU Stall on Scroll) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center overflow-hidden"
              >
                <div className="h-[55vh] w-[85vw] max-w-[1000px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(240,185,11,0.18)_0%,transparent_65%)]" />
              </div>

              {/* Main Titles and Hero CTAs */}
              <motion.div
                key="hero-content"
                className="absolute inset-0 z-10 grid place-items-center text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <div className="mx-auto flex w-full max-w-4xl -translate-y-4 flex-col items-center justify-center px-4 text-center sm:translate-y-0 sm:gap-1 pt-24 sm:pt-12 z-50 sm:px-6">
                  <motion.h1
                    className="text-3xl md:text-8xl font-extrabold"
                    variants={itemVariants}
                  >
                    <span className="text-primary">
                      {t("hero.titleParts.prefix") || "Binance"}
                    </span>{" "}
                    <span className="text-white">
                      {t("hero.titleParts.mining") || "Mining"}
                    </span>
                  </motion.h1>

                  <motion.h2
                    className="mt-1 sm:mt-4 text-xl font-bold text-white md:text-5xl"
                    variants={itemVariants}
                  >
                    {t("hero.subtitle1")}
                  </motion.h2>

                  <motion.h2
                    className="mt-1 sm:mt-4 text-2xl font-bold text-white md:text-5xl"
                    variants={itemVariants}
                  >
                    {t("hero.subtitle2")}
                  </motion.h2>

                  <motion.p
                    className="mt-1 sm:mt-4 text-xs text-white/90 md:text-2xl"
                    variants={itemVariants}
                  >
                    {t("hero.description.line1")}
                    <br />
                    {t("hero.description.line2")}
                  </motion.p>

                  <motion.div
                    className="mt-5 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4"
                    variants={itemVariants}
                  >
                    <Button
                      size="sm"
                      className="sm:hidden font-bold"
                      variant="secondary"
                      asChild
                    >
                      <Link href={`/${locale}#stats`}>
                        {t("hero.viewStats")}
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      className="hidden sm:flex font-bold"
                      variant="secondary"
                      asChild
                    >
                      <Link href={`/${locale}#stats`}>
                        {t("hero.viewStats")}
                      </Link>
                    </Button>
                    <Button size="sm" className="sm:hidden font-extrabold bg-primary text-black hover:bg-primary/90" asChild>
                      <Link href={`/${locale}#plan`}>{t("hero.viewPlan") || (isAr ? "احسب أرباحك" : "Calculate Yield")}</Link>
                    </Button>
                    <Button size="lg" className="hidden sm:flex font-extrabold bg-primary text-black hover:bg-primary/90" asChild>
                      <Link href={`/${locale}#plan`}>{t("hero.viewPlan") || (isAr ? "احسب أرباحك" : "Calculate Yield")}</Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* Showcase Section: Moon & Dashboard Preview (Optimized for 60/120fps Scroll) */}
      <section className="relative overflow-hidden pb-8 sm:pb-36 bg-black">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black to-transparent" />
        <div className="relative z-10 mx-auto flex w-full flex-col items-center px-0 text-center">
          <div className="relative mt-8 flex w-full items-center justify-center sm:mt-12">
            {/* Smooth static radial glow behind moon (No re-rasterization during scroll) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[70vw] max-h-[600px] w-[70vw] max-w-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(240,185,11,0.22)_0%,transparent_68%)] -z-10"
            />

            {/* Moon Image (Hardware accelerated) */}
            <div className="relative aspect-square w-[100vw] max-w-[820px] sm:w-[80vw] transform-gpu">
              <Image
                src="/moon.png"
                alt="Moon"
                fill
                priority={false}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 820px"
                className="object-contain opacity-85"
              />
            </div>

            {/* Dashboard Mockup - Clean CSS Transform */}
            <div className="absolute left-1/2 top-1/2 z-20 w-[86vw] max-w-[680px] aspect-[16/10] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-[#0b0e11] sm:w-[62vw] md:w-[56vw]">
              <Image
                src="/dashboard.png"
                alt="Dashboard preview"
                fill
                priority={false}
                sizes="(max-width: 640px) 86vw, (max-width: 1024px) 62vw, 56vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
