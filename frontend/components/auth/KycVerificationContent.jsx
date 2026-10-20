"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "sonner";
import { useSubmitUserKycMutation } from "@/api/services/user/kyc/kyc.query";
import { useAuth } from "@/components/auth/AuthProvider";

export default function KycVerificationContent({
  compact = false,
  onSubmitted,
}) {
  const { locale, t } = useTranslations();
  const { user, setAuthUser } = useAuth();
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [fullName, setFullName] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [dragTarget, setDragTarget] = useState(null);
  const isArabic = locale === "ar";

  const { mutate: submitKyc, isPending } = useSubmitUserKycMutation({
    onSuccess: () => {
      setFullName("");
      setNationalNumber("");
      setFrontImage(null);
      setBackImage(null);
      setAuthUser({
        ...(user || {}),
        kycStatus: "approved",
      });
      toast.success(
        isArabic
          ? "تم توثيق هويتك بنجاح ومباشرة!"
          : "Your identity has been verified successfully and instantly!",
      );
      onSubmitted?.();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          (isArabic ? "تعذر إرسال التوثيق" : "Failed to submit KYC"),
      );
    },
  });

  const handleOpenPicker = (type) => {
    if (type === "front") {
      frontInputRef.current?.click();
      return;
    }
    backInputRef.current?.click();
  };

  const handleSelectedFile = (file, type) => {
    if (!file) return;

    if (type === "front") {
      setFrontImage(file);
    } else {
      setBackImage(file);
    }

    setDragTarget(null);
  };

  const handleRemoveFile = (type) => {
    if (type === "front") {
      setFrontImage(null);
      if (frontInputRef.current) frontInputRef.current.value = "";
      return;
    }

    setBackImage(null);
    if (backInputRef.current) backInputRef.current.value = "";
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files?.[0];

    handleSelectedFile(file, type);
  };

  const handleDragOver = (event, type) => {
    event.preventDefault();
    setDragTarget(type);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragTarget(null);
  };

  const handleDrop = (event, type) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    handleSelectedFile(file, type);
  };

  const handleKeyDown = (event, type) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenPicker(type);
    }
  };

  const progress = (Number(Boolean(frontImage)) + Number(Boolean(backImage))) * 50;
  const hasBothImages = Boolean(frontImage && backImage);

  const handleSubmit = () => {
    if (!hasBothImages) return;
    if (!fullName.trim() || !nationalNumber.trim()) {
      toast.error(
        isArabic
          ? "يرجى إدخال الاسم الكامل والرقم الوطني"
          : "Please enter full name and national number",
      );
      return;
    }

    submitKyc({
      frontImage,
      backImage,
      fullName: fullName.trim(),
      nationalNumber: nationalNumber.trim(),
    });
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="w-full text-white">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-center ${compact ? "mb-8" : "mb-10"}`}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-primary text-primary">
          <BadgeCheck className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold">{t("kycDialog.title")}</h1>
        <p className="mt-3 text-sm text-white/60">
          {t("kycDialog.subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`w-full rounded-2xl border border-dashed border-white/10 bg-[#1e1e1f] shadow-[0_18px_60px_rgba(0,0,0,0.25)] ${
          compact ? "px-5 py-6 sm:px-6" : "px-6 py-10 sm:px-10"
        }`}
      >
        <input
          ref={frontInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(event) => handleFileChange(event, "front")}
        />

        <input
          ref={backInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(event) => handleFileChange(event, "back")}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white/90">
              {isArabic ? "الاسم الكامل" : "Full Name"}
            </div>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder={isArabic ? "أدخل الاسم الكامل" : "Enter full name"}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white/90">
              {isArabic ? "الرقم الوطني" : "National Number"}
            </div>
            <Input
              value={nationalNumber}
              onChange={(event) => setNationalNumber(event.target.value)}
              placeholder={
                isArabic ? "أدخل الرقم الوطني" : "Enter national number"
              }
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              key: "front",
              label: isArabic ? "الوجه الأمامي" : "Front side",
              file: frontImage,
            },
            {
              key: "back",
              label: isArabic ? "الوجه الخلفي" : "Back side",
              file: backImage,
            },
          ].map((item) => (
            <div
              key={item.key}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenPicker(item.key)}
              onKeyDown={(event) => handleKeyDown(event, item.key)}
              onDragEnter={(event) => handleDragOver(event, item.key)}
              onDragOver={(event) => handleDragOver(event, item.key)}
              onDragLeave={handleDragLeave}
              onDrop={(event) => handleDrop(event, item.key)}
              className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center transition-all ${
                dragTarget === item.key
                  ? "border-primary/60 bg-primary/10"
                  : "border-white/10 bg-black/20 hover:border-primary/30 hover:bg-black/25"
              } ${compact ? "py-8" : "py-12"}`}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/80">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-sm font-semibold text-white/95">
                {item.label}
              </div>
              <div className="mt-2 text-sm text-white/80">
                {item.file
                  ? `${t("kycDialog.dropzone.selectedFile")}: ${item.file.name}`
                  : dragTarget === item.key
                    ? t("kycDialog.dropzone.dragging")
                    : t("kycDialog.dropzone.idle")}
              </div>
              <p className="mt-2 text-xs text-white/45">
                {t("kycDialog.dropzone.supported")}
              </p>
            </div>
          ))}
        </div>

        <div className={compact ? "mt-10" : "mt-14"}>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-white/70">{t("kycDialog.progressLabel")}</span>
            <span className="font-semibold text-white">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-[#20253a]" />
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => handleOpenPicker("front")}
            className="min-w-40"
          >
            {frontImage ? t("kycDialog.replace") : t("kycDialog.upload")}
          </Button>
          {(frontImage || backImage) ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleRemoveFile("front");
                handleRemoveFile("back");
              }}
              className="min-w-40 border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              {t("kycDialog.remove")}
            </Button>
          ) : null}
            <Button
            type="button"
            onClick={handleSubmit}
            disabled={!hasBothImages || isPending}
            className="min-w-40"
          >
            {isPending
              ? (isArabic ? "جاري الإرسال..." : "Submitting...")
              : t("kycDialog.submit")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
