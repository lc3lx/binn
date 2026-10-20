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
import { verifyResetCode } from "@/api/services/user/auth/forgot_password/forgot_password.api";
import { getResetPasswordEmail } from "@/lib/reset-password-flow";

export default function VerifyResetCodePage() {
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

  const schema = z.object({
    resetCode: z
      .string()
      .min(6, { message: t("forgotPassword.validation.codeRequired") }),
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
      await verifyResetCode({ resetCode: values.resetCode });
      toast.success(t("forgotPassword.success.codeVerified"));
      router.push(`/${locale}/user_auth/reset_password`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("forgotPassword.errors.codeFailed"),
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
        {t("forgotPassword.verifyTitle")}
      </motion.h1>

      <p
        className={`mb-2 text-sm text-gray-400 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {t("forgotPassword.verifySubtitle")}
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
            {t("forgotPassword.codeLabel")}
          </label>
          <div className="mt-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("forgotPassword.codePlaceholder")}
              {...register("resetCode")}
              className={`${isArabic ? "text-right" : "text-left"} ${
                errors.resetCode ? "border-red-500" : ""
              }`}
            />
            {errors.resetCode ? (
              <p
                className={`mt-1 text-xs text-red-500 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {errors.resetCode.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button className="w-full" type="submit" size="lg" disabled={isLoading}>
          {isLoading ? (
            <motion.div className="h-5 w-5 rounded-full border-2 border-black border-t-transparent" />
          ) : (
            t("forgotPassword.actions.verifyCode")
          )}
        </Button>
      </form>

      <div
        className={`mt-6 text-sm text-gray-400 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <Link
          href={`/${locale}/user_auth/forgot_password`}
          className="text-primary hover:underline"
        >
          {t("forgotPassword.actions.back")}
        </Link>
      </div>
    </AuthSimpleShell>
  );
}
