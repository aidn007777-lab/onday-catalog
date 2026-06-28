import type { Locale } from "@/types/catalog";
import { SegmentedControl } from "./SegmentedControl";

interface LanguageToggleProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export function LanguageToggle({ locale, onChange }: LanguageToggleProps) {
  return (
    <SegmentedControl
      ariaLabel="Language"
      value={locale}
      options={[
        { value: "ru", label: "RU" },
        { value: "kz", label: "KZ" }
      ]}
      onChange={onChange}
    />
  );
}
