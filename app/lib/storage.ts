export const THEME_KEY = "theme";
export const NAME_KEY = "profile-name";
export const SESSIONS_KEY = "focus-sessions";
export const MINUTES_KEY = "focus-minutes";

export type Theme = "moss" | "dusk";

export function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function rememberLocale(code: string) {
  document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; samesite=lax`;
}
