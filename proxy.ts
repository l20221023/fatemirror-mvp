import { NextRequest, NextResponse } from "next/server";

import { defaultLocale, hasLocale, locales, type Locale } from "./lib/i18n";

const LOCALE_COOKIE = "fm_locale";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameHasLocale) {
    const locale = pathname.split("/")[1];

    if (!hasLocale(locale)) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      maxAge: 60 * 60 * 24 * 180,
    });
    return response;
  }

  const locale = resolveLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

function resolveLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  if (cookieLocale && hasLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptedLanguages = request.headers
    .get("accept-language")
    ?.toLowerCase()
    .split(",")
    .map((value) => value.trim()) ?? [];

  for (const language of acceptedLanguages) {
    if (language.startsWith("zh")) {
      return "zh";
    }

    if (language.startsWith("en")) {
      return "en";
    }
  }

  return defaultLocale;
}
