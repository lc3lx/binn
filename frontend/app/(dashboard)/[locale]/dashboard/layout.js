import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import AdminLayoutShell from "@/components/dashboard/AdminLayoutShell";
import QueryProvider from "@/components/QueryProvider";
import "../../../globals.css";
import { routing } from "@/i18n/routing";
import { ADMIN_AUTH_TOKEN_COOKIE } from "@/api/config";

import { setRequestLocale } from "next-intl/server";
import LocaleAttributes from "@/components/LocaleAttributes";
import { getLocaleFontClass } from "@/lib/fonts";

export default async function DashboardLayout({ children, params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`/${locale}/admin_auth/login`);
  }

  return (
    <QueryProvider>
      <LocaleAttributes locale={locale} />
      <div
        dir={locale === "ar" ? "rtl" : "ltr"}
        data-locale={locale}
        className={getLocaleFontClass(locale)}
      >
        <AdminLayoutShell locale={locale}>{children}</AdminLayoutShell>
      </div>
    </QueryProvider>
  );
}
