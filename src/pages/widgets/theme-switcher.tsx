import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn, segmentedVariants } from "~/lib/tokens";
import {
  applyTheme,
  readThemePreference,
  systemTheme,
  writeThemePreference,
  type ThemePreference,
} from "~/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/** Three-state appearance control. Writes the preference to localStorage and
 * applies it immediately; while System is selected it follows live OS
 * changes. */
export function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    readThemePreference()
  );

  useEffect(() => {
    if (preference !== "system") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const select = (value: ThemePreference) => {
    if (value === preference) {
      return;
    }
    setPreference(value);
    writeThemePreference(value);
  };

  return (
    <div
      role="group"
      aria-label="Appearance"
      className="inline-flex items-center gap-0.5 rounded-10 bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            title={label}
            onClick={() => select(value)}
            className={cn(
              segmentedVariants.item,
              "h-7 w-8",
              active ? segmentedVariants.active : segmentedVariants.inactive
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeSwitcher;
