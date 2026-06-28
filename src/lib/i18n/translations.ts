import type { Locale } from "@/types/catalog";
import { kz } from "./kz";
import { ru } from "./ru";

export const translations = {
  ru,
  kz
} as const;

export type Translation = typeof ru;

export function getTranslation(locale: Locale): Translation {
  return translations[locale];
}
