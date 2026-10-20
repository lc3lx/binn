"use client";

import Link from "next/link";
import { Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export default function SupportButton({ className = "" }) {
  const { locale, t } = useTranslations();
  return (
    <motion.div className={className}>
      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
        <Link
          href={`/${locale}/support`}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary  transition-transform"
          aria-label={t("support.title")}
        >
          <motion.div>
            <Headphones className="h-5 w-5  text-black font-extrabold" />
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
