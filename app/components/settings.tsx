"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEFAULT_TIMER_SETTINGS,
  THEME_KEY,
  TIMER_SETTINGS_KEY,
  type TimerSettings,
  read,
  readTimerSettings,
  rememberLocale,
  write,
} from "../lib/storage";

type Labels = {
  title: string;
  focus: string;
  shortBreak: string;
  longBreak: string;
  sessions: string;
  minutes: string;
  decrease: string;
  increase: string;
  language: string;
  theme: string;
  dark: string;
  light: string;
};

type Theme = "dark" | "light";

const languages = [
  { code: "en", name: "ENG" },
  { code: "ru", name: "RU" },
];

const stepButton =
  "flex size-9 shrink-0 items-center justify-center rounded-full border border-text text-lg leading-none transition-colors hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Settings({ lang, labels }: { lang: string; labels: Labels }) {
  const [settings, setSettings] = useState(DEFAULT_TIMER_SETTINGS);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSettings(readTimerSettings());
    setTheme(read(THEME_KEY) === "light" ? "light" : "dark");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function changeTheme(next: Theme) {
    setTheme(next);
    write(THEME_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  }

  const segment = (active: boolean) =>
    `rounded-xl px-4 py-2 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
      active ? "bg-surface text-accent" : "text-muted hover:text-text"
    }`;

  const fields: { key: keyof TimerSettings; label: string; max: number; step: number; unit?: string }[] = [
    { key: "focus", label: labels.focus, max: 120, step: 5, unit: labels.minutes },
    { key: "shortBreak", label: labels.shortBreak, max: 60, step: 5, unit: labels.minutes },
    { key: "longBreak", label: labels.longBreak, max: 60, step: 5, unit: labels.minutes },
    { key: "sessions", label: labels.sessions, max: 12, step: 1 },
  ];

  function change(key: keyof TimerSettings, value: number) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    write(TIMER_SETTINGS_KEY, JSON.stringify(next));
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-10">
      <h1 className="text-2xl font-semibold">{labels.title}</h1>

      <ul className="flex flex-col gap-6">
        {fields.map(({ key, label, max, step, unit }) => (
          <li key={key} className="flex items-center justify-between gap-4 text-[14px]">
            <span>{label}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => change(key, Math.max(step, settings[key] - step))}
                disabled={settings[key] <= step}
                aria-label={`${labels.decrease}: ${label}`}
                className={stepButton}
              >
                −
              </button>
              <output aria-live="polite" className="w-16 text-center font-semibold tabular-nums">
                {settings[key]}
                {unit && ` ${unit}`}
              </output>
              <button
                type="button"
                onClick={() => change(key, Math.min(max, settings[key] + step))}
                disabled={settings[key] >= max}
                aria-label={`${labels.increase}: ${label}`}
                className={stepButton}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-4 text-[14px]">
        <span id="language-label">{labels.language}</span>
        <div role="group" aria-labelledby="language-label" className="flex rounded-2xl border border-line p-1">
          {languages.map((l) => (
            <Link
              key={l.code}
              href={`/${l.code}/settings`}
              onClick={() => rememberLocale(l.code)}
              aria-current={lang === l.code ? "true" : undefined}
              className={segment(lang === l.code)}
            >
              {l.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-[14px]">
        <span id="theme-label">{labels.theme}</span>
        <div role="group" aria-labelledby="theme-label" className="flex rounded-2xl border border-line p-1">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeTheme(t)}
              aria-pressed={theme === t}
              className={segment(theme === t)}
            >
              {labels[t]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
