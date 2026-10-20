import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import LocaleAttributes from "@/components/LocaleAttributes";
import QueryProvider from "@/components/QueryProvider";
import { setRequestLocale } from "next-intl/server";
import { getLocaleFontClass } from "@/lib/fonts";

export default async function SupportLocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <QueryProvider>
      <LocaleAttributes locale={locale} />
      <div
        dir={locale === "ar" ? "rtl" : "ltr"}
        data-locale={locale}
        className={getLocaleFontClass(locale)}
      >
        {children}
      </div>
    </QueryProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
