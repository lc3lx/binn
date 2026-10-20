import { Cairo, Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

export const getLocaleFontClass = (locale) =>
  locale === "ar" ? cairo.className : inter.className;

