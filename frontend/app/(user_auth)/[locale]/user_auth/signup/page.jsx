"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Users, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SupportButton from "@/components/site/SupportButton";
import useComingSoonToast from "@/components/site/useComingSoonToast";
import { useRouter } from "next/navigation";
import { signUpUser } from "@/api/services/user/auth/sign_up/sign_up.api";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { applyAuthResponse } from "@/lib/auth-session";

// Zod validation schema
const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Minimum 6 characters" }),
    passwordConfirm: z.string().min(6, { message: "Minimum 6 characters" }),
    referralCode: z.string().optional(),
    agreed: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Privacy Notice",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export default function SignupPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const { setAuthUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showReferralField, setShowReferralField] = useState(false);
  const showComingSoonToast = useComingSoonToast();
  const isArabic = locale === "ar";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      referralCode: "",
    },
  });

  const agreed = watch("agreed");
  const referralCodeValue = watch("referralCode");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const code =
        params.get("code") ||
        params.get("ref") ||
        params.get("referralCode") ||
        localStorage.getItem("etg_referral_code");
      if (code) {
        const cleanCode = String(code).trim().toUpperCase();
        setValue("referralCode", cleanCode);
        setShowReferralField(true);
        localStorage.setItem("etg_referral_code", cleanCode);
      }
    } catch {}
  }, [setValue]);

  const getReferralCode = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (!trimmed.includes("http")) return trimmed;
    try {
      const parsed = new URL(trimmed);
      return (
        parsed.searchParams.get("referralCode") ||
        parsed.searchParams.get("ref") ||
        parsed.searchParams.get("code") ||
        trimmed
      );
    } catch {
      return trimmed;
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const response = await signUpUser({
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        ...(showReferralField && data.referralCode
          ? { referralCode: getReferralCode(data.referralCode) }
          : {}),
      });

      if (response?.token) {
        applyAuthResponse(response, setAuthUser);
        toast.success("Account created successfully");
        window.location.replace(`/${locale}/user_dashboard`);
        return;
      }

      toast.success("Account created successfully");
      router.push(`/${locale}/user_auth/login`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Signup failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex text-white bg-gradient-to-br from-black via-[#0b0e11] to-black overflow-hidden"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* LEFT SIDE - ANIMATED */}
      <motion.div
        className="hidden lg:flex w-1/2 flex-col justify-center  items-center  space-y-8 relative"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold leading-tight">
            <div className="flex items-center gap-2">
              <div className="text-white">{t("signup.rewards.upTo")}</div>
              <div className="text-primary">{t("signup.rewards.amount")}</div>
            </div>

            <div className="text-white">
              {t("signup.rewards.signUpRewards")}
            </div>
          </h2>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Image
            src="/sign.svg"
            alt="gift"
            width={220}
            height={220}
            className="drop-shadow-2xl"
          />
        </motion.div>

        <motion.div
          className="space-y-3 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Users className="w-5 h-5 text-primary" />
            {t("signup.rewards.usersTrust")}
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Award className="w-5 h-5 text-primary" />
            {t("signup.rewards.tradingVolume")}
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Shield className="w-5 h-5 text-primary" />
            {t("signup.rewards.fleetFund")}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE - ANIMATED FORM */}
      <motion.div
        className="flex w-full lg:w-1/2 items-center justify-center p-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div
          className="w-full max-w-md bg-ard border border-gray-800 rounded-2xl p-8 shadow-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Logo with animation */}
          <motion.div className="relative mb-6 flex min-h-10 items-center justify-end">
            <Image
              src="/logo.svg"
              alt="logo"
              width={220}
              height={36}
              className="absolute left-0 top-1/2 h-9 w-fit -translate-y-1/2 object-contain"
            />
            <LanguageSwitcher className="bg-card text-white border border-gray-800 hover:border-primary" />
          </motion.div>

          <motion.h1
            className={`mb-6 text-2xl font-semibold ${
              isArabic ? "text-right" : "text-left"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {t("signup.welcome")}
          </motion.h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const nextValue = !showReferralField;
                  setShowReferralField(nextValue);
                  if (!nextValue) {
                    setValue("referralCode", "");
                  }
                }}
                className="w-full "
              >
                {isArabic ? "التسجيل بدعوة صديق" : "Sign up with referral"}
              </Button>
            </motion.div>

            {showReferralField ? (
              <motion.div>
                <label
                  className={`block text-sm text-gray-400 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {isArabic ? "رابط/رمز الدعوة" : "Referral link/code"}
                </label>
                <div className="relative mt-2">
                  <Input
                    type="text"
                    placeholder={
                      isArabic
                        ? "ألصق رابط الدعوة أو الرمز"
                        : "Paste referral link or code"
                    }
                    {...register("referralCode")}
                    className={`${isArabic ? "text-right" : "text-left"}`}
                  />
                </div>
              </motion.div>
            ) : null}

            <motion.div>
              <label
                className={`block text-sm text-gray-400 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                Full Name
              </label>

              <div className="relative mt-2">
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name")}
                  className={`${isArabic ? "text-right" : "text-left"} ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p
                    className={`mt-1 text-xs text-red-500 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {errors.name.message}
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
                className={`block text-sm text-gray-400 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                Password
              </label>

              <div className="relative mt-2">
                <Input
                  type="password"
                  placeholder="Enter your password"
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
              <label
                className={`block text-sm text-gray-400 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                Confirm Password
              </label>

              <div className="relative mt-2">
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  {...register("passwordConfirm")}
                  className={`${isArabic ? "text-right" : "text-left"} ${
                    errors.passwordConfirm ? "border-red-500" : ""
                  }`}
                />
                {errors.passwordConfirm && (
                  <p
                    className={`mt-1 text-xs text-red-500 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {errors.passwordConfirm.message}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Privacy Notice Checkbox */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-start gap-2"
            >
              <input
                type="checkbox"
                id="privacy"
                {...register("agreed")}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-black text-primary focus:ring-primary focus:ring-offset-0"
              />
              <label
                htmlFor="privacy"
                className="text-xs text-gray-500 leading-relaxed"
              >
                {t("signup.privacyPart1")}{" "}
                <Link
                  href={`/${locale}/Privacy`}
                  className="text-primary hover:underline"
                >
                  {t("signup.privacyNotice")}
                </Link>
              </label>
              {errors.agreed && (
                <p className="text-xs text-red-500 w-full">
                  {errors.agreed.message}
                </p>
              )}
            </motion.div>

            {/* Continue button with loading state */}
            <motion.div>
              <Button
                className="w-full"
                type="submit"
                size="lg"
                disabled={isLoading || !agreed}
              >
                {isLoading ? (
                  <motion.div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  t("signup.continue")
                )}
              </Button>
            </motion.div>

            {/* Or Divider */}
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

            {/* Social buttons with icons */}
            <motion.div className="space-y-3">
              <GoogleAuthButton
                locale={locale}
                successMessage="Account created successfully"
                label={
                  showReferralField
                    ? isArabic
                      ? "التسجيل عبر Google مع إحالة"
                      : "Continue with Google (Referral)"
                    : t("signup.google")
                }
                extraPayload={
                  showReferralField && referralCodeValue
                    ? { referralCode: getReferralCode(referralCodeValue) }
                    : {}
                }
              />

              <button
                type="button"
                className="w-full border border-gray-700 rounded-xl py-2 hover:bg-[#1e2329] transition-all flex items-center justify-center gap-2"
                onClick={() => showComingSoonToast()}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                {t("signup.apple")}
              </button>

              <button
                type="button"
                className="w-full border border-gray-700 rounded-xl py-2 hover:bg-[#1e2329] transition-all flex items-center justify-center gap-2"
                onClick={() => showComingSoonToast()}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fill="#0088cc"
                    d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                  />
                </svg>
                {t("signup.telegram")}
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            className="text-center mt-6 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0 }}
          >
            <span className="text-gray-400">{t("signup.haveAccount")}</span>{" "}
            <Link
              href={`/${locale}/user_auth/login`}
              className="text-primary hover:underline"
            >
              {t("signup.login")}
            </Link>
          </motion.div>

          <div className="mt-6 flex justify-center lg:hidden">
            <SupportButton />
          </div>
        </motion.div>
      </motion.div>
    
    </div>
  );
}
