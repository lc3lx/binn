import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_TOKEN_COOKIE,
  USER_AUTH_TOKEN_COOKIE,
} from "@/api/config";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const ADMIN_DASHBOARD_INTERNAL = "dashboard";
const ADMIN_DASHBOARD_PUBLIC = "dashboard-x9cBqC12";

function getLocaleFromPath(pathname) {
  const [, maybeLocale] = pathname.split("/");

  return routing.locales.includes(maybeLocale)
    ? maybeLocale
    : routing.defaultLocale;
}

function isUserLoginPath(pathname, locale) {
  return [
    `/${locale}/user_auth/login`,
    `/${locale}/user_auth/signup`,
  ].includes(pathname);
}

function isAdminLoginPath(pathname, locale) {
  return pathname === `/${locale}/admin_auth/login`;
}

function isProtectedSitePath(pathname, locale) {
  return false;
}

function isProtectedUserDashboardPath(pathname, locale) {
  return pathname.startsWith(`/${locale}/user_dashboard`);
}

function isProtectedAdminDashboardPath(pathname, locale) {
  return (
    pathname.startsWith(`/${locale}/${ADMIN_DASHBOARD_INTERNAL}`) ||
    pathname.startsWith(`/${locale}/${ADMIN_DASHBOARD_PUBLIC}`)
  );
}

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPath(pathname);
  const adminInternalBase = `/${locale}/${ADMIN_DASHBOARD_INTERNAL}`;
  const adminPublicBase = `/${locale}/${ADMIN_DASHBOARD_PUBLIC}`;
  const userToken = request.cookies.get(USER_AUTH_TOKEN_COOKIE)?.value;
  const adminToken = request.cookies.get(ADMIN_AUTH_TOKEN_COOKIE)?.value;
  const isLoggedInUser = Boolean(userToken);
  const isLoggedInAdmin = Boolean(adminToken);

  if (
    pathname === adminInternalBase ||
    pathname.startsWith(`${adminInternalBase}/`)
  ) {
    const targetPath = pathname.replace(adminInternalBase, adminPublicBase);
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  if (pathname === "/") {
    if (isLoggedInAdmin) {
      return NextResponse.redirect(
        new URL(`/${locale}/${ADMIN_DASHBOARD_PUBLIC}`, request.url),
      );
    }

    if (isLoggedInUser) {
      return NextResponse.redirect(
        new URL(`/${locale}/user_dashboard`, request.url),
      );
    }

    return intlMiddleware(request);
  }

  if (
    isUserLoginPath(pathname, locale) &&
    isLoggedInUser
  ) {
    return NextResponse.redirect(new URL(`/${locale}/user_dashboard`, request.url));
  }

  if (isAdminLoginPath(pathname, locale) && isLoggedInAdmin) {
    return NextResponse.redirect(
      new URL(`/${locale}/${ADMIN_DASHBOARD_PUBLIC}`, request.url),
    );
  }

  if (
    isProtectedUserDashboardPath(pathname, locale) &&
    !isLoggedInUser
  ) {
    return NextResponse.redirect(
      new URL(`/${locale}/user_auth/login`, request.url),
    );
  }

  if (isProtectedAdminDashboardPath(pathname, locale) && !isLoggedInAdmin) {
    return NextResponse.redirect(
      new URL(`/${locale}/admin_auth/login`, request.url)
    );
  }

  if (
    pathname === adminPublicBase ||
    pathname.startsWith(`${adminPublicBase}/`)
  ) {
    const internalPath = pathname.replace(adminPublicBase, adminInternalBase);
    return NextResponse.rewrite(new URL(internalPath, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*"],
};
