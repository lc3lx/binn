import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import QueryProvider from "@/components/QueryProvider";
import SiteEntryLoader from "@/components/site/SiteEntryLoader";
import "../../globals.css";
import { routing } from "@/i18n/routing";
import LocaleAttributes from "@/components/LocaleAttributes";
import { setRequestLocale } from "next-intl/server";
import { getLocaleFontClass } from "@/lib/fonts";

export default async function LocaleLayout({ children, params }) {
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
        <SiteEntryLoader />
        <Navigation />
        {children}
      </div>
    </QueryProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
