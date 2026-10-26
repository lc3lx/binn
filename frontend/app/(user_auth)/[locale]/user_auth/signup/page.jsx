"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, User, Mail, Lock, Gift, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SupportButton from "@/components/site/SupportButton";
import { useRouter } from "next/navigation";
import { signUpUser } from "@/api/services/user/auth/sign_up/sign_up.api";
import { useAuth } from "@/components/auth/AuthProvider";
import { applyAuthResponse } from "@/lib/auth-session";

// Simplified fast signup schema
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  referralCode: z.string().optional(),
});

export default function FastSignupPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const { setAuthUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const isArabic = locale === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      referralCode: "",
    },
  });

  const referralCodeValue = watch("referralCode");

  // Auto-capture referral code from URL or localStorage
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
        setShowReferralInput(true);
        localStorage.setItem("etg_referral_code", cleanCode);
      }
    } catch {}
  }, [setValue]);

  const cleanReferralCode = (val) => {
    const raw = String(val || "").trim();
    if (!raw) return "";
    if (!raw.includes("http")) return raw;
    try {
      const parsed = new URL(raw);
      return (
        parsed.searchParams.get("code") ||
        parsed.searchParams.get("ref") ||
        parsed.searchParams.get("referralCode") ||
        raw
      );
    } catch {
      return raw;
    }
  };

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);

      const refCode = cleanReferralCode(values.referralCode);
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        passwordConfirm: values.password, // auto-matches password
        ...(refCode ? { referralCode: refCode } : {}),
      };

      const response = await signUpUser(payload);

      if (response?.token) {
        applyAuthResponse(response, setAuthUser);
        toast.success(
          isArabic ? "تم إنشاء حسابك وتفعيله بنجاح!" : "Account created successfully!"
        );
        window.location.replace(`/${locale}/user_dashboard/tasks`);
        return;
      }

      toast.success(
        isArabic ? "تم إنشاء الحساب بنجاح، جاري الدخول..." : "Account created successfully!"
      );
      router.push(`/${locale}/user_auth/login`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isArabic ? "فشل إنشاء الحساب، يرجى المحاولة ثانية" : "Signup failed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#04070e] via-[#091120] to-[#04070e] p-4 sm:p-6 relative overflow-hidden"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background Cyber Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <SupportButton className="fixed bottom-6 z-40 ltr:right-6 rtl:left-6" />

      <motion.div
        className="w-full max-w-md bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top Header with Logo and Language Switcher */}
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/${locale}`} className="block">
            <Image
              src="/logo.svg"
              alt="ETG RIDE Logo"
              width={160}
              height={36}
              className="h-8 w-fit object-contain"
            />
          </Link>
          <LanguageSwitcher className="bg-slate-800/80 text-white border border-slate-700 hover:border-cyan-400 text-xs" />
        </div>

        {/* Title & Quick Value Prop */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isArabic ? "تسجيل حساب جديد" : "Create Account"}
          </h1>
          <p className="text-xs text-slate-400">
            {isArabic
              ? "تسجيل سريع خلال 10 ثوانٍ، تفعيل فوري وسحب يومي للأرباح"
              : "Quick 10-second setup, instant activation & daily withdrawals"}
          </p>
        </div>

        {/* The Fast Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isArabic ? "الاسم الكامل" : "Full Name"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                placeholder={isArabic ? "أدخل اسمك الكامل" : "Enter your full name"}
                {...register("name")}
                className={`h-11 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl ltr:pl-10 rtl:pr-10 ${
                  errors.name ? "border-red-500" : "focus:border-cyan-400"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isArabic ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={`h-11 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl ltr:pl-10 rtl:pr-10 ${
                  errors.email ? "border-red-500" : "focus:border-cyan-400"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isArabic ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="password"
                placeholder={isArabic ? "6 أحرف أو أرقام على الأقل" : "At least 6 characters"}
                {...register("password")}
                className={`h-11 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl ltr:pl-10 rtl:pr-10 ${
                  errors.password ? "border-red-500" : "focus:border-cyan-400"
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Referral Code (Collapsible / Auto-populated) */}
          <div className="pt-1">
            {!showReferralInput ? (
              <button
                type="button"
                onClick={() => setShowReferralInput(true)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{isArabic ? "هل لديك كود إحالة / دعوة صديق؟" : "Have a referral code?"}</span>
              </button>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isArabic ? "كود أو رابط الإحالة" : "Referral Code"}
                </label>
                <div className="relative">
                  <Gift className="w-4 h-4 text-amber-400 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder={isArabic ? "أدخل كود الإحالة (اختياري)" : "Enter referral code (optional)"}
                    {...register("referralCode")}
                    className="h-11 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl ltr:pl-10 rtl:pr-10 uppercase tracking-wider font-mono text-xs focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Direct CTA Submit Button */}
          <div className="pt-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-blue-950/60 border border-cyan-400/40 transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 mr-1 text-cyan-200" />
              <span>
                {isLoading
                  ? isArabic ? "جارٍ إنشاء الحساب وتفعيله..." : "Creating Account..."
                  : isArabic ? "إنشاء الحساب وبدء الاستثمار الآن" : "Create Account & Start Earning"}
              </span>
              <ArrowIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>

        {/* Bottom Login Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>{isArabic ? "هل لديك حساب بالفعل؟" : "Already have an account?"}</span>{" "}
          <Link
            href={`/${locale}/user_auth/login`}
            className="text-cyan-400 font-extrabold hover:underline ml-1"
          >
            {isArabic ? "تسجيل الدخول" : "Sign in here"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
