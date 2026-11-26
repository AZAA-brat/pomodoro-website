export const SESSIONS_KEY = "focus-sessions";
export const MINUTES_KEY = "focus-minutes";
export const TIMER_SETTINGS_KEY = "timer-settings";
export const THEME_KEY = "theme";

// Durations in minutes; `sessions` is focus sessions before a long break.
export type TimerSettings = { focus: number; shortBreak: number; longBreak: number; sessions: number };

export const DEFAULT_TIMER_SETTINGS: TimerSettings = { focus: 25, shortBreak: 5, longBreak: 15, sessions: 4 };

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

export function readTimerSettings(): TimerSettings {
  try {
    const saved = JSON.parse(read(TIMER_SETTINGS_KEY) ?? "{}");
    const settings = { ...DEFAULT_TIMER_SETTINGS };
    for (const key of Object.keys(settings) as (keyof TimerSettings)[]) {
      if (Number.isInteger(saved[key]) && saved[key] > 0) settings[key] = saved[key];
    }
    return settings;
  } catch {
    return DEFAULT_TIMER_SETTINGS;
  }
}

export const FOCUS_LOG_KEY = "focus-log";

// One entry per completed focus session; `at` is the completion time in ms.
export type FocusEntry = { at: number; minutes: number; task: string };

export function readFocusLog(): FocusEntry[] {
  try {
    const log = JSON.parse(read(FOCUS_LOG_KEY) ?? "[]");
    return Array.isArray(log) ? log : [];
  } catch {
    return [];
  }
}

// shortcut: whole log kept in one localStorage value (~60 bytes/session), move to IndexedDB if it nears the 5MB quota.
export function logFocus(entry: FocusEntry) {
  write(FOCUS_LOG_KEY, JSON.stringify([...readFocusLog(), entry]));
}
