import { notFound } from "next/navigation";

import { hasLocale, locales } from "../../lib/i18n";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = LayoutProps<"/[locale]">;

export default async function LocaleLayout(props: LocaleLayoutProps) {
  const { locale } = await props.params;

  if (!hasLocale(locale)) {
    notFound();
  }

  return props.children;
}
