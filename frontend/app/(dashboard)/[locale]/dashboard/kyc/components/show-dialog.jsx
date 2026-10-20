"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const copy = {
  en: {
    title: "KYC Documents",
    description: "Review the submitted KYC details and document images.",
    front: "Front Image",
    back: "Back Image",
    empty: "No document image",
    fields: {
      fullName: "Full Name",
      userId: "User ID",
      userCode: "User Code",
      email: "Email",
      accountStatus: "Account Status",
      kycStatus: "KYC Status",
      nationalNumber: "National Number",
      submittedAt: "Submitted At",
      reviewedAt: "Reviewed At",
      reviewedBy: "Reviewed By",
      rejectionReason: "Rejection Reason",
    },
  },
  ar: {
    title: "مستندات التوثيق",
    description: "راجع تفاصيل التوثيق وصور المستند الأمامية والخلفية.",
    front: "الصورة الأمامية",
    back: "الصورة الخلفية",
    empty: "لا توجد صورة مرفوعة",
    fields: {
      fullName: "الاسم الكامل",
      userId: "معرّف المستخدم",
      userCode: "كود المستخدم",
      email: "البريد الإلكتروني",
      accountStatus: "حالة الحساب",
      kycStatus: "حالة التوثيق",
      nationalNumber: "الرقم الوطني",
      submittedAt: "تاريخ الإرسال",
      reviewedAt: "تاريخ المراجعة",
      reviewedBy: "تمت المراجعة بواسطة",
      rejectionReason: "سبب الرفض",
    },
  },
};

function ImageCard({ title, src, alt, emptyText }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a1b] p-3">
      <div className="mb-2 text-xs text-white/55">{title}</div>
      <div className="overflow-hidden rounded-md border border-white/10 bg-black/30">
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={760}
            height={520}
            className="h-auto w-full object-contain"
          />
        ) : (
          <div className="grid h-[160px] place-items-center text-xs text-white/45">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShowKycDialog({
  open,
  onOpenChange,
  locale,
  frontImage,
  backImage,
  fullName,
  userId,
  userCode,
  email,
  accountStatus,
  kycStatus,
  nationalNumber,
  submittedAt,
  reviewedAt,
  reviewedBy,
  rejectionReason,
}) {
  const isArabic = locale === "ar";
  const text = isArabic ? copy.ar : copy.en;

  const details = [
    { label: text.fields.fullName, value: fullName },
    { label: text.fields.userId, value: userId },
    { label: text.fields.userCode, value: userCode },
    { label: text.fields.email, value: email },
    { label: text.fields.accountStatus, value: accountStatus },
    { label: text.fields.kycStatus, value: kycStatus },
    { label: text.fields.nationalNumber, value: nationalNumber },
    { label: text.fields.submittedAt, value: submittedAt },
    { label: text.fields.reviewedAt, value: reviewedAt },
    { label: text.fields.reviewedBy, value: reviewedBy },
    { label: text.fields.rejectionReason, value: rejectionReason || "--" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`border-white/10 bg-[#202021] text-white sm:max-w-4xl ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription className="text-white/55">
            {text.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-[#1a1a1b] p-3 md:grid-cols-2">
          {details.map((item) => (
            <div key={item.label} className="text-xs">
              <span className="text-white/50">{item.label}: </span>
              <span className="text-white/85">{item.value || "--"}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ImageCard
            title={text.front}
            src={frontImage}
            alt={text.front}
            emptyText={text.empty}
          />
          <ImageCard
            title={text.back}
            src={backImage}
            alt={text.back}
            emptyText={text.empty}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
