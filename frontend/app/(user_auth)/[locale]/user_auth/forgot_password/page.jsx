"use client";

import { useState } from "react";
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
import { forgotPassword } from "@/api/services/user/auth/forgot_password/forgot_password.api";
import { setResetPasswordEmail } from "@/lib/reset-password-flow";
import { formatApiError } from "@/lib/format-error";

export default function ForgotPasswordPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const isArabic = locale === "ar";
  const [isLoading, setIsLoading] = useState(false);

  const schema = z.object({
    email: z
      .string()
      .min(1, { message: t("forgotPassword.validation.emailRequired") })
      .email({ message: t("forgotPassword.validation.emailInvalid") }),
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
      await forgotPassword({ email: values.email });
      setResetPasswordEmail(values.email);
      toast.success(t("forgotPassword.success.emailSent"));
      router.push(`/${locale}/user_auth/verify_reset_code`);
    } catch (error) {
      toast.error(formatApiError(error, locale));
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
        {t("forgotPassword.title")}
      </motion.h1>

      <p
        className={`mb-6 text-sm text-gray-400 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {t("forgotPassword.subtitle")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            className={`block text-sm text-gray-400 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            {t("signup.emailPhone")}
          </label>
          <div className="mt-2">
            <Input
              type="email"
              placeholder={t("signup.emailPlaceholder")}
              {...register("email")}
              className={`${isArabic ? "text-right" : "text-left"} ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email ? (
              <p
                className={`mt-1 text-xs text-red-500 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {errors.email.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button className="w-full" type="submit" size="lg" disabled={isLoading}>
          {isLoading ? (
            <motion.div className="h-5 w-5 rounded-full border-2 border-black border-t-transparent" />
          ) : (
            t("forgotPassword.actions.sendCode")
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
