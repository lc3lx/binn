import {notFound} from 'next/navigation';

export const locales = ['en', 'ar'];
export const defaultLocale = 'en';

export async function getDictionary(locale) {
  try {
    if (!locales.includes(locale)) {
      notFound();
    }

    const dictionary = await import(`./locales/${locale}.json`);
    return dictionary.default;
  } catch (error) {
    console.error(`Error loading dictionary for locale "${locale}":`, error);
    notFound();
  }
}

export function getDirection(locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export const defaultTimeZone = 'UTC';