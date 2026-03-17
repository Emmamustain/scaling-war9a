import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const locales = ["en", "fr", "ar"] as const;
type Locale = (typeof locales)[number];

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const locale = cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : "fr";

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
