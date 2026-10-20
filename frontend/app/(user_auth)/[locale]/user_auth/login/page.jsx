"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SupportButton from "@/components/site/SupportButton";
import useComingSoonToast from "@/components/site/useComingSoonToast";
import { loginUser } from "@/api/services/user/auth/login/login.api";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { applyAuthResponse } from "@/lib/auth-session";

export default function LoginPage() {
  const { t, locale } = useTranslations();
  const showComingSoonToast = useComingSoonToast();
  const { setAuthUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isArabic = locale === "ar";

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Minimum 6 characters" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await loginUser(data);
      const authUser = applyAuthResponse(response, setAuthUser);

      toast.success(isArabic ? "تم تسجيل الدخول بنجاح" : "Login successfully");
      window.location.replace(`/${locale}/${authUser?.role === "admin" ? "dashboard-x9cBqC12" : "user_dashboard"}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Login failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-black via-[#0b0e11] to-black p-6 relative"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <motion.div
        className="w-full max-w-md bg-card border border-gray-800 rounded-2xl p-8 shadow-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="relative mb-6 flex min-h-10 items-center justify-end">
          <Image
            src="/logo.svg"
            alt="logo"
            width={220}
            height={36}
            className="absolute left-0 top-1/2 h-9 w-fit -translate-y-1/2 object-contain"
          />
          <LanguageSwitcher />
        </motion.div>

        <motion.h1
          className={`text-2xl font-semibold mb-6 ${
            isArabic ? "text-right" : "text-left"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t("login.welcome")}
        </motion.h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <motion.div>
            <label
              className={`block text-sm text-gray-400 ${
                isArabic ? "text-right" : "text-left"
              }`}
            >
              {t("signup.emailPhone")}
            </label>
            <div className="relative mt-2">
              <Input
                type="email"
                placeholder={t("signup.emailPlaceholder")}
                {...register("email")}
                className={`${isArabic ? "text-right" : "text-left"} ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p
                  className={`text-xs text-red-500 mt-1 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {errors.email.message}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div>
            <label
              className={`block text-sm text-gray-400 ${
                isArabic ? "text-right" : "text-left"
              }`}
            >
              {t("login.password")}
            </label>
            <div className="relative mt-2">
              <Input
                type="password"
                placeholder={t("login.passwordPlaceholder")}
                {...register("password")}
                className={`${isArabic ? "text-right" : "text-left"} ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              {errors.password && (
                <p
                  className={`text-xs text-red-500 mt-1 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className={`mt-2 ${isArabic ? "text-right" : "text-left"}`}>
              <Link
                href={`/${locale}/user_auth/forgot_password`}
                className="text-sm text-primary hover:underline"
              >
                {t("login.forgotPassword")}
              </Link>
            </div>
          </motion.div>

          <motion.div>
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                t("signup.continue")
              )}
            </Button>
          </motion.div>

          <motion.div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0b0e11] text-gray-500">
                {t("signup.or")}
              </span>
            </div>
          </motion.div>

          <motion.div className="space-y-3">
            <GoogleAuthButton
              locale={locale}
              successMessage="Login successful"
              label={t("signup.google")}
            />

            <button
              type="button"
              className="w-full border border-gray-700 rounded-xl py-2 hover:bg-[#1e2329] transition-all flex items-center justify-center gap-2"
              onClick={() => showComingSoonToast()}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {t("signup.apple")}
            </button>

            <button
              type="button"
              className="w-full border border-gray-700 rounded-xl py-2 hover:bg-[#1e2329] transition-all flex items-center justify-center gap-2"
              onClick={() => showComingSoonToast()}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fill="#0088cc"
                  d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                />
              </svg>
              {t("signup.telegram")}
            </button>
          </motion.div>
        </form>

        <motion.div
          className="text-center mt-6 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-gray-400">{t("login.noAccount")}</span>{" "}
          <Link
            href={`/${locale}/user_auth/signup`}
            className="text-primary hover:underline"
          >
            {t("login.createAccount")}
          </Link>
        </motion.div>

        <div className="mt-6 flex justify-center md:hidden">
          <SupportButton />
        </div>
      </motion.div>
    
    </div>
  );
}
