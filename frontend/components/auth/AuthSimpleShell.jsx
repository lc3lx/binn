"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SupportButton from "@/components/site/SupportButton";

export default function AuthSimpleShell({
  children,
  isArabic,
  supportClassName = "absolute bottom-0 end-8",
  showSupport = true,
}) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-[#0b0e11] to-black p-6 text-white"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border border-gray-800 bg-card p-8 shadow-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="mb-6 flex items-center justify-between">
          <Image
            src="/logo.svg"
            alt="logo"
            width={25}
            height={25}
            className="h-8 w-fit"
          />
          <LanguageSwitcher />
        </motion.div>
        {children}
      </motion.div>
      {showSupport ? <SupportButton className={supportClassName} /> : null}
    </div>
  );
}
