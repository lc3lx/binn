import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/components/auth/AuthProvider";
import { cookies, headers } from "next/headers";
import { AUTH_USER_COOKIE } from "@/api/config";
import { parseStoredAuthUser } from "@/lib/auth-user";
import { cairo, inter } from "@/lib/fonts";

export const metadata = {
  title: "Binance Mining",
  description: "Platform for Mining & Yield Management",
  icons: {
    icon: "/loading-logo.png",
    apple: "/loading-logo.png",
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const headerLocale = headerStore.get("x-next-intl-locale");
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = headerLocale === "ar" || cookieLocale === "ar" ? "ar" : "en";
  const initialUser = parseStoredAuthUser(
    cookieStore.get(AUTH_USER_COOKIE)?.value,
  );

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-locale={locale}
      className={`scroll-smooth ${inter.variable} ${cairo.variable}`}
    >
      <head>
        <link rel="icon" href="/loading-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/loading-logo.png" />
      </head>
      <body className="min-h-full  bg-background text-foreground antialiased">
        <AuthProvider initialUser={initialUser}>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            theme="dark"
            toastOptions={{
              classNames: {
                toast:
                  "bg-[#0b0e11] border border-gray-800 text-white rounded-xl shadow-lg",
                title: "text-white font-semibold",
                description: "text-gray-400",
                icon: "bg-primary text-black rounded-full",
                actionButton: "bg-primary text-black rounded-md",
                cancelButton: "bg-white/10 text-white rounded-md",
                closeButton: "text-white/80 hover:text-white",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
