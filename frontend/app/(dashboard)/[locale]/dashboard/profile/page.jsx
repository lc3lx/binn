"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useAdminProfileQuery,
  useChangeAdminProfilePasswordMutation,
  useUpdateAdminProfileMutation,
} from "@/api/services/admin/profile/profile.query";
import { useTranslations } from "@/hooks/useTranslations";

export default function AdminProfilePage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";

  const text = isArabic
    ? {
        title: "الملف الشخصي",
        subtitle: "إدارة بيانات حساب الأدمن وكلمة المرور",
        loading: "جارٍ تحميل بيانات الحساب...",
        error: "تعذر جلب بيانات الحساب",
        profileSection: "معلومات الحساب",
        passwordSection: "تغيير كلمة المرور",
        saveProfile: "حفظ البيانات",
        savingProfile: "جارٍ الحفظ...",
        savePassword: "تحديث كلمة المرور",
        savingPassword: "جارٍ التحديث...",
        profileSuccess: "تم تحديث بيانات الحساب بنجاح",
        profileError: "تعذر تحديث بيانات الحساب",
        passwordSuccess: "تم تغيير كلمة المرور بنجاح",
        passwordError: "تعذر تغيير كلمة المرور",
        passwordMismatch: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
        fields: {
          name: "الاسم",
          email: "البريد الإلكتروني",
          phone: "رقم الهاتف",
          timezone: "المنطقة الزمنية",
          language: "اللغة",
          profileImg: "صورة الحساب",
          currentPassword: "كلمة المرور الحالية",
          newPassword: "كلمة المرور الجديدة",
          confirmNewPassword: "تأكيد كلمة المرور الجديدة",
        },
      }
    : {
        title: "Profile",
        subtitle: "Manage admin account details and password",
        loading: "Loading account data...",
        error: "Failed to load account data",
        profileSection: "Account Details",
        passwordSection: "Change Password",
        saveProfile: "Save Profile",
        savingProfile: "Saving...",
        savePassword: "Update Password",
        savingPassword: "Updating...",
        profileSuccess: "Profile updated successfully",
        profileError: "Failed to update profile",
        passwordSuccess: "Password changed successfully",
        passwordError: "Failed to change password",
        passwordMismatch: "New password and confirm password do not match",
        fields: {
          name: "Name",
          email: "Email",
          phone: "Phone",
          timezone: "Timezone",
          language: "Language",
          profileImg: "Profile Image",
          currentPassword: "Current Password",
          newPassword: "New Password",
          confirmNewPassword: "Confirm New Password",
        },
      };

  const { data, isLoading, isError, error } = useAdminProfileQuery();
  const profile = data?.data;

  const [draft, setDraft] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const getFieldValue = (key) => {
    if (Object.prototype.hasOwnProperty.call(draft, key)) return String(draft[key] ?? "");
    return String(profile?.[key] ?? "");
  };

  const onChangeDraft = (key) => (e) => {
    const value = e.target.value;
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onChangePassword = (key) => (e) => {
    const value = e.target.value;
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
  };

  const { mutate: updateProfile, isPending: isUpdatingProfile } =
    useUpdateAdminProfileMutation({
      onSuccess: () => {
        toast.success(text.profileSuccess);
        setDraft({});
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || text.profileError);
      },
    });

  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangeAdminProfilePasswordMutation({
      onSuccess: () => {
        toast.success(text.passwordSuccess);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || text.passwordError);
      },
    });

  const handleSaveProfile = () => {
    const payload = {
      name: getFieldValue("name"),
      phone: getFieldValue("phone"),
      timezone: getFieldValue("timezone"),
      language: getFieldValue("language"),
      profileImg: getFieldValue("profileImg"),
    };
    updateProfile(payload);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error(text.passwordMismatch);
      return;
    }
    changePassword(passwordForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 text-white sm:p-6">
        <div className="mx-auto max-w-5xl rounded-lg border border-white/10 bg-sidebar p-4 text-sm text-white/75">
          {text.loading}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-4 text-white sm:p-6">
        <div className="mx-auto max-w-5xl rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error?.response?.data?.message || text.error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 text-white sm:p-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <h1 className="text-3xl font-bold leading-none text-white">{text.title}</h1>
          <p className="mt-2 text-sm text-white/45">{text.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-sidebar p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">{text.profileSection}</h2>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-xs text-white/45">{text.fields.name}</label>
                <Input
                  value={getFieldValue("name")}
                  onChange={onChangeDraft("name")}
                  className="border-white/10 bg-[#2d2d2f] text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">{text.fields.email}</label>
                <Input
                  value={getFieldValue("email")}
                  readOnly
                  className="border-white/10 bg-[#2d2d2f] text-white/70"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">{text.fields.phone}</label>
                <Input
                  value={getFieldValue("phone")}
                  onChange={onChangeDraft("phone")}
                  className="border-white/10 bg-[#2d2d2f] text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">{text.fields.timezone}</label>
                <Input
                  value={getFieldValue("timezone")}
                  onChange={onChangeDraft("timezone")}
                  className="border-white/10 bg-[#2d2d2f] text-white"
                />
              </div>
             
            </div>
            <Button onClick={handleSaveProfile} disabled={isUpdatingProfile} className="mt-4">
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className={isArabic ? "mr-2" : "ml-2"}>{text.savingProfile}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span className={isArabic ? "mr-2" : "ml-2"}>{text.saveProfile}</span>
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg border border-white/10 bg-sidebar p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">{text.passwordSection}</h2>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-xs text-white/45">
                  {text.fields.currentPassword}
                </label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={onChangePassword("currentPassword")}
                  className="border-white/10 bg-[#2d2d2f] text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">
                  {text.fields.newPassword}
                </label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={onChangePassword("newPassword")}
                  className="border-white/10 bg-[#2d2d2f] text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">
                  {text.fields.confirmNewPassword}
                </label>
                <Input
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={onChangePassword("confirmNewPassword")}
                  className="border-white/10 bg-[#2d2d2f] text-white"
                />
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="mt-4"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className={isArabic ? "mr-2" : "ml-2"}>{text.savingPassword}</span>
                </>
              ) : (
                text.savePassword
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
