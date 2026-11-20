"use client";

import { useEffect, useRef, useState } from "react";
import { MINUTES_KEY, SESSIONS_KEY, read, write } from "../lib/storage";

type Mode = "focus" | "shortBreak" | "longBreak";

const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const TICKS = 25;

type Labels = {
  focus: string;
  shortBreak: string;
  longBreak: string;
  start: string;
  pause: string;
  resume: string;
  reset: string;
  modes: string;
};

function format(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function Timer({ labels }: { labels: Labels }) {
  const [mode, setMode] = useState<Mode>("focus");
  const [left, setLeft] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const endAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + left * 1000;
    const id = setInterval(() => {
      const next = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(next);
      if (next === 0) {
        setRunning(false);
        if (mode === "focus") {
          write(SESSIONS_KEY, String(Number(read(SESSIONS_KEY) ?? 0) + 1));
          write(MINUTES_KEY, String(Number(read(MINUTES_KEY) ?? 0) + DURATIONS.focus / 60));
        }
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  function selectMode(next: Mode) {
    setRunning(false);
    setMode(next);
    setLeft(DURATIONS[next]);
  }

  function reset() {
    setRunning(false);
    setLeft(DURATIONS[mode]);
  }

  const total = DURATIONS[mode];
  const filled = Math.floor(((total - left) / total) * TICKS);
  const label = running ? labels.pause : left < total && left > 0 ? labels.resume : labels.start;

  return (
    <section className="flex w-full flex-col items-center gap-10">
      <div role="tablist" aria-label={labels.modes} className="flex flex-wrap justify-center gap-x-8 gap-y-3">
        {(Object.keys(DURATIONS) as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => selectMode(m)}
            className={`relative pb-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
              mode === m ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            {labels[m]}
            <span
              className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-linear-to-r from-accent to-accent-2 transition-opacity ${
                mode === m ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>
        ))}
      </div>

      <p
        aria-live="off"
        className="select-none text-[clamp(5.5rem,22vw,15rem)] leading-none font-extralight tracking-[-0.04em] tabular-nums"
      >
        {format(left)}
      </p>

      <div className="flex max-w-80 flex-wrap justify-center gap-[3px]" aria-hidden>
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            className={`h-[22px] w-1 rounded-sm transition-colors duration-300 ${
              i < filled ? "bg-linear-to-b from-accent to-accent-2" : "bg-line"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setRunning((r) => !r)}
          className="min-w-36 rounded-full bg-linear-to-r from-accent to-accent-2 px-10 py-3.5 text-[14px] text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {label}
        </button>
        <button
          onClick={reset}
          className="rounded-full border border-line bg-surface px-5 py-3.5 text-[14px] text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {labels.reset}
        </button>
      </div>
    </section>
  );
}
