"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Headphones, Zap, Save, Wallet } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import {
  usePlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} from "@/api/services/admin/platform-settings/platform-settings.query";

const INITIAL_FORM = {
  bep20DepositWalletAddress: "",
  trc20DepositWalletAddress: "",
  contactEmail: "",
  contactPhone: "",
  telegramUrl: "",
  whatsappUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  starterDailyRatePercent: "",
  starterDurationDays: "",
  eliteDailyRatePercent: "",
  eliteDurationDays: "",
  minimumWithdrawal: "",
  maximumWithdrawal: "",
  level1CommissionPercent: "",
  level2CommissionPercent: "",
};

const NUMBER_FIELDS = [
  "starterDailyRatePercent",
  "starterDurationDays",
  "eliteDailyRatePercent",
  "eliteDurationDays",
  "minimumWithdrawal",
  "maximumWithdrawal",
  "level1CommissionPercent",
  "level2CommissionPercent",
];

export default function AdminPlatformSettingsPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";

  const text = isArabic
    ? {
        title: "إعدادات المنصة",
        subtitle: "إدارة المحافظ، نسب العوائد، حدود السحب، وعمولات الإحالة",
        save: "حفظ التعديلات",
        saving: "جارٍ الحفظ...",
        copy: "نسخ",
        copySuccess: "تم نسخ عنوان المحفظة",
        copyError: "تعذر نسخ العنوان",
        loadError: "تعذر جلب إعدادات المنصة",
        saveSuccess: "تم تحديث إعدادات المنصة بنجاح",
        saveError: "تعذر تحديث إعدادات المنصة",
        walletTitle: "عنوان محفظة الإيداع BEP-20 (BNB Smart Chain)",
        walletDescription: "عنوان المحفظة المعتمد لاستقبال تحويلات USDT عبر شبكة BEP-20",
        walletLabel: "تحديث عنوان محفظة BEP-20 (0x...)",
        sectionTitle: "إعدادات العوائد والعمولات",
        fields: {
          starterDailyRatePercent: "النسبة اليومية لخطة Starter (%)",
          starterDurationDays: "مدة خطة Starter (أيام)",
          eliteDailyRatePercent: "النسبة اليومية لخطة Elite (%)",
          eliteDurationDays: "مدة خطة Elite (أيام)",
          minimumWithdrawal: "الحد الأدنى للسحب (USDT)",
          maximumWithdrawal: "الحد الأعلى للسحب (USDT)",
          level1CommissionPercent: "عمولة المستوى الأول (%)",
          level2CommissionPercent: "عمولة المستوى الثاني (%)",
        },
        contactTitle: "معلومات التواصل والدعم وحسابات المنصة",
        contactSubtitle: "تظهر هذه المعلومات لجميع الزوار في أسفل الموقع (الفوتر) وروابط التواصل",
        contactFields: {
          contactEmail: "البريد الإلكتروني للدعم (Support Email)",
          contactPhone: "رقم الهاتف / الاتصال (Phone / Support)",
          telegramUrl: "رابط قناة أو حساب تيليجرام (Telegram Link)",
          whatsappUrl: "رابط أو رقم واتساب (WhatsApp Link / Number)",
          twitterUrl: "رابط حساب تويتر / X (Twitter / X URL)",
          instagramUrl: "رابط حساب انستغرام (Instagram URL)",
        },
      }
    : {
        title: "Platform Settings",
        subtitle: "Manage wallet, rates, withdrawal limits, and referral commissions",
        save: "Save Changes",
        saving: "Saving...",
        copy: "Copy",
        copySuccess: "Wallet address copied",
        copyError: "Failed to copy wallet address",
        loadError: "Failed to load platform settings",
        saveSuccess: "Platform settings updated successfully",
        saveError: "Failed to update platform settings",
        walletTitle: "BEP-20 Deposit Wallet Address (BNB Smart Chain)",
        walletDescription: "Primary wallet address for receiving BEP-20 USDT deposits",
        walletLabel: "Update BEP-20 Wallet Address (0x...)",
        sectionTitle: "Rates & Commission Settings",
        fields: {
          starterDailyRatePercent: "Starter Daily Rate (%)",
          starterDurationDays: "Starter Duration (days)",
          eliteDailyRatePercent: "Elite Daily Rate (%)",
          eliteDurationDays: "Elite Duration (days)",
          minimumWithdrawal: "Minimum Withdrawal (USDT)",
          maximumWithdrawal: "Maximum Withdrawal (USDT)",
          level1CommissionPercent: "Level 1 Commission (%)",
          level2CommissionPercent: "Level 2 Commission (%)",
        },
        contactTitle: "Contact & Support Information",
        contactSubtitle: "This information is displayed to all visitors in the website footer and social channels",
        contactFields: {
          contactEmail: "Support Email",
          contactPhone: "Phone / Support Number",
          telegramUrl: "Telegram Link / Channel",
          whatsappUrl: "WhatsApp Link / Number",
          twitterUrl: "Twitter / X Profile URL",
          instagramUrl: "Instagram Profile URL",
        },
      };

  const { data, isLoading, isError, error } = usePlatformSettingsQuery();
  const settings = data?.data;
  const [draft, setDraft] = useState({});

  const fields = useMemo(
    () => [
      "starterDailyRatePercent",
      "starterDurationDays",
      "eliteDailyRatePercent",
      "eliteDurationDays",
      "minimumWithdrawal",
      "maximumWithdrawal",
      "level1CommissionPercent",
      "level2CommissionPercent",
    ],
    [],
  );

  const { mutate: updateSettings, isPending } = useUpdatePlatformSettingsMutation({
    onSuccess: () => toast.success(text.saveSuccess),
    onError: (err) => toast.error(err?.response?.data?.message || text.saveError),
  });

  const getFieldValue = (key) => {
    if (Object.prototype.hasOwnProperty.call(draft, key)) return String(draft[key] ?? "");
    return String(settings?.[key] ?? INITIAL_FORM[key] ?? "");
  };

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onCopyWallet = async () => {
    const wallet = getFieldValue("bep20DepositWalletAddress") || getFieldValue("trc20DepositWalletAddress");
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      toast.success(text.copySuccess);
    } catch {
      toast.error(text.copyError);
    }
  };

  const onSave = () => {
    const payload = NUMBER_FIELDS.reduce(
      (acc, key) => ({
        ...acc,
        [key]:
          getFieldValue(key) === "" || Number.isNaN(Number(getFieldValue(key)))
            ? 0
            : Number(getFieldValue(key)),
      }),
      {
        bep20DepositWalletAddress: getFieldValue("bep20DepositWalletAddress") || "",
        trc20DepositWalletAddress: getFieldValue("trc20DepositWalletAddress") || "",
        contactEmail: getFieldValue("contactEmail") || "",
        contactPhone: getFieldValue("contactPhone") || "",
        telegramUrl: getFieldValue("telegramUrl") || "",
        whatsappUrl: getFieldValue("whatsappUrl") || "",
        twitterUrl: getFieldValue("twitterUrl") || "",
        instagramUrl: getFieldValue("instagramUrl") || "",
      },
    );

    updateSettings(payload);
  };

  if (isError) {
    return (
      <div className="min-h-screen p-4 text-white sm:p-6">
        <div className="mx-auto max-w-7xl rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error?.response?.data?.message || text.loadError}
        </div>
      </div>
    );
  }

  if (isLoading && !settings) {
    return (
      <div className="min-h-screen p-4 text-white sm:p-6">
        <div className="mx-auto max-w-7xl rounded-lg border border-white/10 bg-sidebar p-4 text-sm text-white/75">
          {isArabic ? "جارٍ تحميل الإعدادات..." : "Loading settings..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 text-white sm:p-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-none text-white">{text.title}</h1>
            <p className="mt-2 text-sm text-white/45">{text.subtitle}</p>
          </div>

          <Button onClick={onSave} disabled={isLoading || isPending}>
            <Save className="h-4 w-4" />
            <span className={isArabic ? "mr-2" : "ml-2"}>
              {isPending ? text.saving : text.save}
            </span>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="rounded-[10px] border border-white/5 bg-sidebar p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">{text.walletTitle}</div>
                <div className="mt-1 text-xs text-white/35">{text.walletDescription}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-md border border-white/10 bg-[#2d2d2f] px-4 py-3 text-sm text-white/75 font-mono">
                {getFieldValue("bep20DepositWalletAddress") || getFieldValue("trc20DepositWalletAddress") || "-"}
              </div>
              <Button
                type="button"
                onClick={onCopyWallet}
                disabled={!getFieldValue("bep20DepositWalletAddress") && !getFieldValue("trc20DepositWalletAddress")}
                className="h-10 rounded-md border border-white/10 bg-[#2d2d2f] px-4 text-sm text-white/55 hover:bg-[#353537] hover:text-white"
              >
                <Copy className="h-5 w-5" />
                <span className={isArabic ? "mr-2" : "ml-2"}>{text.copy}</span>
              </Button>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs text-white/35">{text.walletLabel}</label>
              <Input
                value={getFieldValue("bep20DepositWalletAddress")}
                onChange={handleChange("bep20DepositWalletAddress")}
                placeholder="0x..."
                className="h-10 rounded-md border-white/10 bg-[#2d2d2f] text-sm text-white placeholder:text-white/25 font-mono"
              />
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-sidebar p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold text-white">{text.sectionTitle}</div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fields.map((key) => (
                <div key={key}>
                  <label className="mb-2 block text-xs text-white/35">{text.fields[key]}</label>
                  <Input
                    type="number"
                    step="any"
                    value={getFieldValue(key)}
                    onChange={handleChange(key)}
                    className="h-10 rounded-md border-white/10 bg-[#2d2d2f] text-sm text-white placeholder:text-white/25"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-sidebar p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">{text.contactTitle}</div>
                <div className="mt-1 text-xs text-white/35">{text.contactSubtitle}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs text-white/35">
                  {text.contactFields.contactEmail}
                </label>
                <Input
                  type="email"
                  value={getFieldValue("contactEmail")}
                  onChange={handleChange("contactEmail")}
                  placeholder="support@etg-ride.com"
                  className="h-10 rounded-md border-white/10 bg-[#2d2d2f] text-sm text-white placeholder:text-white/25"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/35">
                  {text.contactFields.contactPhone}
                </label>
                <Input
                  type="text"
                  value={getFieldValue("contactPhone")}
                  onChange={handleChange("contactPhone")}
                  placeholder="+1 (555) 019-2834"
                  className="h-10 rounded-md border-white/10 bg-[#2d2d2f] text-sm text-white placeholder:text-white/25"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/35">
                  {text.contactFields.telegramUrl}
                </label>
                <Input
                  type="text"
                  value={getFieldValue("telegramUrl")}
                  onChange={handleChange("telegramUrl")}
                  placeholder="https://t.me/etgride"
                  className="h-10 rounded-md border-white/10 bg-[#2d2d2f] text-sm text-white placeholder:text-white/25 font-mono"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/35">
                  {text.contactFields.whatsappUrl}
                </label>
                <Input
                  type="text"
                  value={getFieldValue("whatsappUrl")}
                  onChange={handleChange("whatsappUrl")}
                  placeholder="https://wa.me/..."
                  className="h-10 rounded-md border-white/10 bg-[#2d2d2f] text-sm text-white placeholder:text-white/25 font-mono"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/35">
                  {text.contactFields.twitterUrl}
                </label>
                <Input
                  type="text"
                  value={getFieldValue("twitterUrl")}
                  onChange={handleChange("twitterUrl")}
                  placeholder="https://x.com/etgride"
                  className="h-10 rounded-md border-white/10 bg-[#2d2d2f] text-sm text-white placeholder:text-white/25 font-mono"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/35">
                  {text.contactFields.instagramUrl}
                </label>
                <Input
                  type="text"
                  value={getFieldValue("instagramUrl")}
                  onChange={handleChange("instagramUrl")}
                  placeholder="https://instagram.com/etgride"
                  className="h-10 rounded-md border-white/10 bg-[#2d2d2f] text-sm text-white placeholder:text-white/25 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
