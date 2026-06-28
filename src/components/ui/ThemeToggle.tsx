import type { ThemeMode } from "@/types/catalog";

interface ThemeToggleProps {
  theme: ThemeMode;
  label: string;
  onChange: (theme: ThemeMode) => void;
}

export function ThemeToggle({ theme, label, onChange }: ThemeToggleProps) {
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button className="icon-button" type="button" aria-label={label} title={label} onClick={() => onChange(nextTheme)}>
      {theme === "dark" ? "☾" : "☼"}
    </button>
  );
}
