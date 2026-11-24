"use client";

import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";
import { DEFAULT_TIMER_SETTINGS, MINUTES_KEY, SESSIONS_KEY, read, readTimerSettings, write } from "../lib/storage";

type Mode = "focus" | "shortBreak" | "longBreak";

const MODES: Mode[] = ["focus", "shortBreak", "longBreak"];

// Ring colour per mode; `ink` is the text/icon colour on top of it.
const SCHEMES: Record<Mode, { color: string; ink: string }> = {
  focus: { color: "#a85b0a", ink: "#ffffff" },
  shortBreak: { color: "#f2b33a", ink: "#151833" },
  longBreak: { color: "#6fd3a8", ink: "#151833" },
};

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Labels = {
  focus: string;
  shortBreak: string;
  longBreak: string;
  start: string;
  pause: string;
  resume: string;
  reset: string;
  skip: string;
  modes: string;
  task: string;
  taskPlaceholder: string;
  shortBreakMessage: string;
  longBreakMessage: string;
  session: string;
  sessionsDone: string;
};

function format(seconds: number) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function fill(template: string, n: number, total: number) {
  return template.replace("{n}", String(n)).replace("{total}", String(total));
}

const outlined =
  "rounded-full border border-line px-5 py-2.5 text-[14px] text-text transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mode)";

// Lives in the layout so it keeps running on other pages; only shown on the timer page.
export function Timer({ lang, labels }: { lang: string; labels: Labels }) {
  const visible = usePathname() === `/${lang}`;
  const [settings, setSettings] = useState(DEFAULT_TIMER_SETTINGS);
  const [mode, setMode] = useState<Mode>("focus");
  const [left, setLeft] = useState(DEFAULT_TIMER_SETTINGS.focus * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0); // focus sessions finished in the current cycle
  const [task, setTask] = useState("");
  const endAt = useRef(0);
  const cycle = settings.sessions;

  // Re-reads settings each time the timer page is shown; an untouched, paused timer picks up the new duration.
  useEffect(() => {
    if (!visible) return;
    const saved = readTimerSettings();
    /* eslint-disable react-hooks/set-state-in-effect */
    setSettings(saved);
    if (!running && left === settings[mode] * 60) setLeft(saved[mode] * 60);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function switchTo(next: Mode) {
    setRunning(false);
    setMode(next);
    setLeft(settings[next] * 60);
  }

  // Moves to the next step of the cycle; only a completed focus session counts toward profile stats.
  function advance(completed: boolean) {
    if (mode === "focus") {
      if (completed) {
        write(SESSIONS_KEY, String(Number(read(SESSIONS_KEY) ?? 0) + 1));
        write(MINUTES_KEY, String(Number(read(MINUTES_KEY) ?? 0) + settings.focus));
      }
      const next = Math.min(done + 1, cycle);
      setDone(next);
      switchTo(next === cycle ? "longBreak" : "shortBreak");
    } else {
      if (done >= cycle) setDone(0);
      switchTo("focus");
    }
  }

  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + left * 1000;
    const id = setInterval(() => {
      const next = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(next);
      if (next === 0) {
        clearInterval(id);
        advance(true);
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode, settings]);

  const total = settings[mode] * 60;
  const label = running ? labels.pause : left < total && left > 0 ? labels.resume : labels.start;
  const scheme = SCHEMES[mode];
  const remaining = total > 0 ? Math.min(1, left / total) : 0;
  // Knob moves clockwise from 12 o'clock as time elapses; the remaining arc runs from the knob back to 12.
  const angle = (1 - remaining) * 2 * Math.PI;

  return (
    <section
      suppressHydrationWarning
      hidden={!visible}
      className="flex w-full flex-col items-center gap-8 font-display text-text"
      style={{ "--mode": scheme.color, "--mode-ink": scheme.ink } as CSSProperties}
    >
      <div
        role="tablist"
        aria-label={labels.modes}
        className="flex flex-wrap justify-center gap-1 rounded-full border border-line bg-surface p-1"
      >
        {MODES.map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchTo(m)}
            className={`rounded-full px-4 py-1.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mode) ${
              mode === m ? "bg-(--mode) text-(--mode-ink)" : "text-muted hover:text-text"
            }`}
          >
            {labels[m]}
          </button>
        ))}
      </div>

      <div className="relative aspect-square w-full max-w-sm">
        <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
          <circle cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="8" className="stroke-line" />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={scheme.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={-CIRCUMFERENCE * (1 - remaining)}
            transform="rotate(-90 100 100)"
          />
          <circle
            cx={100 + RADIUS * Math.sin(angle)}
            cy={100 - RADIUS * Math.cos(angle)}
            r="7"
            fill={scheme.color}
            strokeWidth="3"
            className="stroke-bg"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-12 text-center">
          {mode === "focus" ? (
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              aria-label={labels.task}
              placeholder={labels.taskPlaceholder}
              suppressHydrationWarning
              className="w-full max-w-56 rounded-full border border-line bg-surface px-4 py-1.5 text-center text-[13px] placeholder:text-muted focus-visible:border-(--mode) focus-visible:outline-none"
            />
          ) : (
            <p className="max-w-56 text-[13px] text-muted">
              {mode === "shortBreak" ? labels.shortBreakMessage : labels.longBreakMessage}
            </p>
          )}
          <p className="text-[13px] tracking-widest text-muted uppercase">{labels[mode]}</p>
          <p
            aria-live="off"
            suppressHydrationWarning
            className="select-none text-6xl leading-none font-black tracking-tight tabular-nums sm:text-7xl"
          >
            {format(left)}
          </p>
          <p className="text-[12px] text-muted">
            {mode === "focus" ? fill(labels.session, Math.min(done + 1, cycle), cycle) : fill(labels.sessionsDone, done, cycle)}
          </p>
          <div className="flex gap-2" aria-hidden>
            {Array.from({ length: cycle }, (_, i) => (
              <span
                key={i}
                className={`size-2 rounded-full border border-(--mode) ${
                  i < done ? "bg-(--mode)" : i === done && mode === "focus" ? "bg-(--mode)/50" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => switchTo(mode)} className={outlined}>
          {labels.reset}
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          aria-label={label}
          className="flex size-16 items-center justify-center rounded-full bg-(--mode) text-4xl text-(--mode-ink) shadow-lg transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mode)"
        >
          {running ? <MdPause suppressHydrationWarning /> : <MdPlayArrow suppressHydrationWarning />}
        </button>
        <button onClick={() => advance(false)} className={outlined}>
          {labels.skip}
        </button>
      </div>
    </section>
  );
}
