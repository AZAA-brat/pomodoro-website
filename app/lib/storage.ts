export const SESSIONS_KEY = "focus-sessions";
export const MINUTES_KEY = "focus-minutes";
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

// Keeps only valid positive whole numbers from saved data, defaulting the rest.
function parseTimerSettings(saved: Partial<TimerSettings>): TimerSettings {
  const settings = { ...DEFAULT_TIMER_SETTINGS };
  for (const key of Object.keys(settings) as (keyof TimerSettings)[]) {
    const value = saved[key];
    if (Number.isInteger(value) && value! > 0) settings[key] = value!;
  }
  return settings;
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

export const PROJECTS_KEY = "projects";

// `goal` is the daily focus goal in hours; focus sessions log the project name as their task.
export type Project = TimerSettings & { name: string; goal: number; color: string };

// Default colours handed to new projects in turn; any hex colour can be picked after.
export const PROJECT_COLORS = ["#e5675a", "#f2b33a", "#6fd3a8", "#5aa9e6", "#b38ce0", "#e58fc1"];

export function readProjects(): Project[] {
  try {
    const projects = JSON.parse(read(PROJECTS_KEY) ?? "[]");
    if (!Array.isArray(projects)) return [];
    // Projects saved before colours or timer durations existed get defaults.
    return projects.map((p, i) => ({
      ...p,
      ...parseTimerSettings(p),
      color: p.color ?? PROJECT_COLORS[i % PROJECT_COLORS.length],
    }));
  } catch {
    return [];
  }
}

export function writeProjects(projects: Project[]) {
  write(PROJECTS_KEY, JSON.stringify(projects));
}
