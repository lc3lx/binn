"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import AuthSimpleShell from "@/components/auth/AuthSimpleShell";
import { adminLoginUser } from "@/api/services/admin/auth/login/login.api";
import { clearAdminSession } from "@/api/instance";
import { useAuth } from "@/components/auth/AuthProvider";
import { applyAuthResponse } from "@/lib/auth-session";

export default function AdminLoginPage() {
  const { t, locale } = useTranslations();
  const { setAuthUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isArabic = locale === "ar";

  const adminLoginSchema = z.object({
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
    resolver: zodResolver(adminLoginSchema),
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      const response = await adminLoginUser(values);

      if (response?.data?.role !== "admin") {
        clearAdminSession();
        toast.error("This account does not have admin access");
        return;
      }

      applyAuthResponse(response, setAuthUser);
      toast.success("Admin login successful");
      window.location.assign(`/${locale}/dashboard-x9cBqC12`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Login failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSimpleShell isArabic={isArabic} showSupport={false}>
      <motion.h1
        className={`mb-1 text-2xl font-semibold ${
          isArabic ? "text-right" : "text-left"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {t("login.welcome")}
      </motion.h1>
      <p
        className={`mb-6 text-xs text-white/60 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {isArabic ? "تسجيل دخول لوحة تحكم الإدارة" : "Administrator Portal Access"}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <motion.div>
          <label
            className={`text-sm text-gray-400 ${
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
                className={`mt-1 text-xs text-red-500 ${
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
            className={`text-sm text-gray-400 ${
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
                className={`mt-1 text-xs text-red-500 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {errors.password.message}
              </p>
            )}
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
          User Login
        </Link>
      </div>
    </AuthSimpleShell>
  );
}
