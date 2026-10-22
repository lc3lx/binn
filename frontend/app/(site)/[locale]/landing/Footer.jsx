"use client";

import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { motion } from "framer-motion";
import { usePlatformSettingsQuery } from "@/api/services/admin/platform-settings/platform-settings.query";
import { Mail, Phone, Send, MessageCircle } from "lucide-react";

export default function Footer() {
  const { t, locale } = useTranslations();
  const align = locale === "ar" ? "text-right" : "text-left";
  const isAr = locale === "ar";
  const year = new Date().getFullYear();

  const { data: settingsData } = usePlatformSettingsQuery();
  const settings = settingsData?.data || {};

  const contactEmail = settings.contactEmail || "support@binancecoins.com";
  const contactPhone = settings.contactPhone || "";
  const telegramUrl = "https://t.me/binancsmaing";
  const whatsappUrl = settings.whatsappUrl || "";
  const twitterUrl = settings.twitterUrl || "https://x.com/binancecoins";
  const instagramUrl = settings.instagramUrl || "";

  const formatWhatsAppLink = (input) => {
    if (!input) return "";
    if (input.startsWith("http://") || input.startsWith("https://")) return input;
    const cleanNumber = input.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}`;
  };

  const socials = [
    { key: "telegram", href: telegramUrl, label: "Telegram" },
    { key: "whatsapp", href: formatWhatsAppLink(whatsappUrl), label: "WhatsApp" },
    { key: "twitter-x", href: twitterUrl, label: "X" },
    { key: "instagram", href: instagramUrl, label: "Instagram" },
  ].filter((s) => Boolean(s.href));

  const containerVar = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
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

  const glowVar = {
    animate: {
      y: [0, -8, 0],
      scale: [1, 1.05, 1],
      opacity: [0.18, 0.28, 0.18],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const SocialIcon = ({ name, className = "w-6 h-6" }) => {
    if (name === "twitter-x") {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"></path>
        </svg>
      );
    }
    if (name === "telegram") {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"></path>
        </svg>
      );
    }
    if (name === "whatsapp") {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.17 8.17 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44s-.56-1.35-.77-1.85c-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29" />
        </svg>
      );
    }
    if (name === "instagram") {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"></path>
        </svg>
      );
    }
    return null;
  };

  return (
    <footer
      dir={isAr ? "rtl" : "ltr"}
      className="w-full bg-black relative overflow-hidden border-t border-gray-900"
    >
      <motion.div
        className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVar}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <motion.div className="md:col-span-1" variants={itemVar}>
            <div className={`text-white ${align}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-primary">Binance</span>
                <span className="text-xl font-bold text-white">Mining</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/60">
                {isAr
                  ? "منصة التعدين السحابي الذكية لعملة USDT عبر شبكة BEP-20، توفر عوائد يومية مستقرة مع أمان وسرعة في السحب."
                  : "Next-generation cloud mining platform for USDT on BEP-20 network with stable daily profits, fast withdrawals, and high security."}
              </p>
            </div>
          </motion.div>

          {/* Resources links */}
          <motion.div variants={itemVar}>
            <div className={`text-white text-sm font-semibold ${align}`}>
              {t("footer.resources")}
            </div>
            <div className={`flex flex-col gap-2.5 mt-3 text-xs ${align}`}>
              <Link href={`/${locale}#plan`} className="text-white/70 hover:text-primary transition-colors">
                {t("footer.linkPlans")}
              </Link>
              <Link href={`/${locale}#stats`} className="text-white/70 hover:text-primary transition-colors">
                {t("footer.linkStats")}
              </Link>
              <Link href={`/${locale}#how-it-works`} className="text-white/70 hover:text-primary transition-colors">
                {t("footer.linkHowItWorks")}
              </Link>
            </div>
          </motion.div>

          {/* Legal links */}
          <motion.div variants={itemVar}>
            <div className={`text-white text-sm font-semibold ${align}`}>
              {t("footer.legal")}
            </div>
            <div className={`flex flex-col gap-2.5 mt-3 text-xs ${align}`}>
              <Link href={`/${locale}/Privacy`} className="text-white/70 hover:text-primary transition-colors">
                {t("footer.privacy")}
              </Link>
            </div>
          </motion.div>

          {/* Dynamic Contact info */}
          <motion.div variants={itemVar}>
            <div className={`text-white text-sm font-semibold ${align}`}>
              {t("footer.contact")}
            </div>
            <div className={`flex flex-col gap-3 mt-3 text-xs ${align}`}>
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{contactEmail}</span>
                </a>
              )}

              {contactPhone && (
                <a
                  href={formatWhatsAppLink(contactPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span dir="ltr">{contactPhone}</span>
                </a>
              )}

              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors"
                >
                  <Send className="w-4 h-4 text-primary shrink-0" />
                  <span>{t("footer.telegram")}</span>
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={formatWhatsAppLink(whatsappUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>{t("footer.whatsapp")}</span>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Bar: Copyright & Socials */}
      <div className="w-full border-t border-gray-900 bg-black/60" />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <div className="text-xs text-white/60 text-center sm:text-start">
          {`Copyright ${year} © Binance Mining. `}
          {t("footer.allRightsReserved")}
        </div>

        {socials.length > 0 && (
          <div className="flex items-center gap-2 relative z-50">
            {socials.map((s, i) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-10 h-10 rounded-full grid place-items-center hover:bg-primary/10 text-white/80 hover:text-primary transition-all duration-200"
              >
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.06 * i }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex"
                >
                  <SocialIcon name={s.key} className="w-5 h-5" />
                </motion.span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Ambient background glows */}
      <motion.div
        className="bg-primary/20 -bottom-8 -left-8 blur-3xl rounded-full z-0 w-64 h-64 absolute pointer-events-none"
        variants={glowVar}
        animate="animate"
      />
      <motion.div
        className="bg-primary/20 -bottom-8 -right-8 blur-3xl rounded-full z-0 w-64 h-64 absolute pointer-events-none"
        variants={glowVar}
        animate="animate"
      />
    </footer>
  );
}
