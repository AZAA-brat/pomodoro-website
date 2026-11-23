"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEFAULT_TIMER_SETTINGS,
  TIMER_SETTINGS_KEY,
  type TimerSettings,
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
};

const languages = [
  { code: "en", name: "ENG" },
  { code: "ru", name: "RU" },
];

const stepButton =
  "flex size-9 shrink-0 items-center justify-center rounded-full border border-text text-lg leading-none transition-colors hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Settings({ lang, labels }: { lang: string; labels: Labels }) {
  const [settings, setSettings] = useState(DEFAULT_TIMER_SETTINGS);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(readTimerSettings());
  }, []);

  const fields: { key: keyof TimerSettings; label: string; max: number; unit?: string }[] = [
    { key: "focus", label: labels.focus, max: 120, unit: labels.minutes },
    { key: "shortBreak", label: labels.shortBreak, max: 60, unit: labels.minutes },
    { key: "longBreak", label: labels.longBreak, max: 60, unit: labels.minutes },
    { key: "sessions", label: labels.sessions, max: 12 },
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
        {fields.map(({ key, label, max, unit }) => (
          <li key={key} className="flex items-center justify-between gap-4 text-[14px]">
            <span>{label}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => change(key, settings[key] - 1)}
                disabled={settings[key] <= 1}
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
                onClick={() => change(key, settings[key] + 1)}
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
              className={`rounded-xl px-4 py-2 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                lang === l.code ? "bg-surface text-accent" : "text-muted hover:text-text"
              }`}
            >
              {l.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
