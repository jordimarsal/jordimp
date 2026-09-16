export const LOCALES = ['en', 'es', 'ca'] as const;
export type Locale = (typeof LOCALES)[number];

export function L<T>(field: Record<Locale, T>, lang: Locale): T {
  return field[lang] ?? field.en;
}

export const localeNames: Record<Locale, string> = { en: 'EN', es: 'ES', ca: 'CA' };
