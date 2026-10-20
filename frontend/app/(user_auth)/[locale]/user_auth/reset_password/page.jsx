"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import AuthSimpleShell from "@/components/auth/AuthSimpleShell";
import { resetPassword } from "@/api/services/user/auth/forgot_password/forgot_password.api";
import {
  clearResetPasswordEmail,
  getResetPasswordEmail,
} from "@/lib/reset-password-flow";

export default function ResetPasswordPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const isArabic = locale === "ar";
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = getResetPasswordEmail();

    if (!storedEmail) {
      router.replace(`/${locale}/user_auth/forgot_password`);
      return;
    }

    setEmail(storedEmail);
  }, [locale, router]);

  const schema = z
    .object({
      newPassword: z
        .string()
        .min(6, { message: t("forgotPassword.validation.passwordRequired") }),
      confirmPassword: z
        .string()
        .min(6, { message: t("forgotPassword.validation.confirmRequired") }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("forgotPassword.validation.passwordsMatch"),
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      await resetPassword({
        email,
        newPassword: values.newPassword,
      });
      clearResetPasswordEmail();
      toast.success(t("forgotPassword.success.passwordReset"));
      router.push(`/${locale}/user_auth/login`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("forgotPassword.errors.resetFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSimpleShell isArabic={isArabic}>
      <motion.h1
        className={`mb-3 text-2xl font-semibold ${
          isArabic ? "text-right" : "text-left"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {t("forgotPassword.resetTitle")}
      </motion.h1>

      <p
        className={`mb-2 text-sm text-gray-400 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {t("forgotPassword.resetSubtitle")}
      </p>
      <p
        className={`mb-6 text-sm text-primary ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {email}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            className={`block text-sm text-gray-400 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            {t("forgotPassword.newPassword")}
          </label>
          <div className="mt-2">
            <Input
              type="password"
              placeholder={t("forgotPassword.newPasswordPlaceholder")}
              {...register("newPassword")}
              className={`${isArabic ? "text-right" : "text-left"} ${
                errors.newPassword ? "border-red-500" : ""
              }`}
            />
            {errors.newPassword ? (
              <p
                className={`mt-1 text-xs text-red-500 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {errors.newPassword.message}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label
            className={`block text-sm text-gray-400 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            {t("forgotPassword.confirmPassword")}
          </label>
          <div className="mt-2">
            <Input
              type="password"
              placeholder={t("forgotPassword.confirmPasswordPlaceholder")}
              {...register("confirmPassword")}
              className={`${isArabic ? "text-right" : "text-left"} ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
            />
            {errors.confirmPassword ? (
              <p
                className={`mt-1 text-xs text-red-500 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button className="w-full" type="submit" size="lg" disabled={isLoading}>
          {isLoading ? (
            <motion.div className="h-5 w-5 rounded-full border-2 border-black border-t-transparent" />
          ) : (
            t("forgotPassword.actions.resetPassword")
          )}
        </Button>
      </form>

      <div
        className={`mt-6 text-sm text-gray-400 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <Link
          href={`/${locale}/user_auth/login`}
          className="text-primary hover:underline"
        >
          {t("forgotPassword.actions.backToLogin")}
        </Link>
      </div>
    </AuthSimpleShell>
  );
}
