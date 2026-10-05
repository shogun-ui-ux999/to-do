/* Theme preference handling. The inline script in index.html reads the same
 * storage key before first paint, so these helpers must stay in sync with it:
 * stored values are "system" | "light" | "dark" (default "system"), and the
 * resolved value is written to <html data-theme> plus color-scheme. */

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "tally-theme";

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Storage can be unavailable (private mode); fall back to System.
    return "system";
  }
}

export function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? systemTheme() : preference;
}

/** Keep the browser chrome (address bar / title bar) in step with the
 * palette, exactly like the inline script in index.html does before paint.
 * Without this, switching theme in-app left the old colour up until reload. */
function applyThemeColor(theme: ResolvedTheme): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta !== null) {
    meta.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
  }
}

export function applyTheme(preference: ThemePreference): void {
  const theme = resolveTheme(preference);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  applyThemeColor(theme);
}

export function writeThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // The theme still applies for this session even if persistence fails.
  }
  applyTheme(preference);
}
