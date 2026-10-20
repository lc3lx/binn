import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import GoogleAuthProvider from "@/components/auth/GoogleAuthProvider";
import LocaleAttributes from "@/components/LocaleAttributes";
import { setRequestLocale } from "next-intl/server";
import { getLocaleFontClass } from "@/lib/fonts";

export default async function UserAuthLocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <GoogleAuthProvider>
      <LocaleAttributes locale={locale} />
      <div
        dir={locale === "ar" ? "rtl" : "ltr"}
        data-locale={locale}
        className={getLocaleFontClass(locale)}
      >
        {children}
      </div>
    </GoogleAuthProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
