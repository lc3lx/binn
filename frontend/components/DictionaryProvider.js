// components/DictionaryProvider.js
"use client";

import { NextIntlClientProvider } from "next-intl";

/**
 * Wrapper component لتغليف الأطفال بالرسائل locale
 * @param {Object} props
 * @param {string} props.locale
 * @param {Object} props.messages
 * @param {React.ReactNode} props.children
 */
export function DictionaryProvider({ locale, messages, children }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
