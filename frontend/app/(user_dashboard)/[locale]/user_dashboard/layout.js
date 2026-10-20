import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/sidebar";
import QueryProvider from "@/components/QueryProvider";
import "@/app/globals.css";
import { routing } from "@/i18n/routing";
import DashboardHeader from "@/components/dashboard/Header";
import { USER_AUTH_TOKEN_COOKIE } from "@/api/config";
import LocaleAttributes from "@/components/LocaleAttributes";
import { setRequestLocale } from "next-intl/server";
import { getLocaleFontClass } from "@/lib/fonts";

export default async function UserDashboardLayout({ children, params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const token = cookieStore.get(USER_AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`/${locale}/user_auth/login`);
  }

  return (
    <QueryProvider>
      <LocaleAttributes locale={locale} />
      <div
        dir={locale === "ar" ? "rtl" : "ltr"}
        data-locale={locale}
        className={`min-h-screen flex flex-col border-2  border-accent bg-background ${getLocaleFontClass(locale)}`}
      >
        <div className="flex flex-1">
          <DashboardSidebar />
          <div className="flex flex-col flex-1">
            <DashboardHeader />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
    </QueryProvider>
  );
}
