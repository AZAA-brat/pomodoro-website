"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { MINUTES_KEY, SESSIONS_KEY, read, write } from "../lib/storage";

type Mode = "focus" | "shortBreak" | "longBreak";

const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const CYCLE = 4;

// Tide palette: `top` is the drained part, `bottom` is time remaining.
// Focus is pure white/black with difference blending, so white ink flips to black over the white half.
const SCHEMES: Record<Mode, { top: string; bottom: string; ink: string; blend: boolean }> = {
  focus: { top: "#ffffff", bottom: "#000000", ink: "#ffffff", blend: true },
  shortBreak: { top: "#faefd6", bottom: "#f2b33a", ink: "#151833", blend: false },
  longBreak: { top: "#e3f5ec", bottom: "#6fd3a8", ink: "#151833", blend: false },
};

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
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function fill(template: string, n: number) {
  return template.replace("{n}", String(n)).replace("{total}", String(CYCLE));
}

const outlined =
  "rounded-full border border-(--ink) bg-(--water) px-5 py-2.5 text-[14px] text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--ink)";

export function Timer({ labels }: { labels: Labels }) {
  const [mode, setMode] = useState<Mode>("focus");
  const [left, setLeft] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0); // focus sessions finished in the current cycle
  const [task, setTask] = useState("");
  const endAt = useRef(0);

  function switchTo(next: Mode) {
    setRunning(false);
    setMode(next);
    setLeft(DURATIONS[next]);
  }

  // Moves to the next step of the cycle; only a completed focus session counts toward profile stats.
  function advance(completed: boolean) {
    if (mode === "focus") {
      if (completed) {
        write(SESSIONS_KEY, String(Number(read(SESSIONS_KEY) ?? 0) + 1));
        write(MINUTES_KEY, String(Number(read(MINUTES_KEY) ?? 0) + DURATIONS.focus / 60));
      }
      const next = Math.min(done + 1, CYCLE);
      setDone(next);
      switchTo(next === CYCLE ? "longBreak" : "shortBreak");
    } else {
      if (done >= CYCLE) setDone(0);
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
  }, [running, mode]);

  const total = DURATIONS[mode];
  const label = running ? labels.pause : left < total && left > 0 ? labels.resume : labels.start;
  const scheme = SCHEMES[mode];
  const drained = ((total - left) / total) * 100;

  return (
    <section
      suppressHydrationWarning
      className="flex w-full flex-col items-center gap-8 font-display"
      style={{ "--ink": scheme.ink, "--water": scheme.bottom } as CSSProperties}
    >
      <div
        aria-hidden
        suppressHydrationWarning
        className="fixed inset-0 -z-10"
        style={{ background: `linear-gradient(to bottom, ${scheme.top} ${drained}%, ${scheme.bottom} ${drained}%)` }}
      />

      <div
        role="tablist"
        aria-label={labels.modes}
        className="flex flex-wrap justify-center gap-1 rounded-full bg-neutral-200/80 p-1 backdrop-blur"
      >
        {(Object.keys(DURATIONS) as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchTo(m)}
            className={`rounded-full px-4 py-1.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151833] ${
              mode === m ? "bg-[#151833] text-white" : "text-[#151833]/70 hover:text-[#151833]"
            }`}
          >
            {labels[m]}
          </button>
        ))}
      </div>

      <div className={`flex flex-col items-center gap-8 text-(--ink) ${scheme.blend ? "mix-blend-difference" : ""}`}>
        <p
          aria-live="off"
          suppressHydrationWarning
          className="select-none text-[clamp(6rem,26vw,17rem)] leading-[0.85] font-black tracking-[-0.06em] tabular-nums"
        >
          {format(left)}
        </p>

        {mode === "focus" ? (
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            aria-label={labels.task}
            placeholder={labels.taskPlaceholder}
            suppressHydrationWarning
            className="w-72 max-w-full border-b border-(--ink)/60 bg-transparent pb-2 text-center text-lg placeholder:text-(--ink)/50 focus-visible:border-(--ink) focus-visible:outline-none"
          />
        ) : (
          <p className="text-lg">{mode === "shortBreak" ? labels.shortBreakMessage : labels.longBreakMessage}</p>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className="min-w-28 rounded-full bg-(--ink) px-8 py-2.5 text-[14px] text-(--water) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--ink)"
          >
            {label}
          </button>
          <button onClick={() => switchTo(mode)} className={outlined}>
            {labels.reset}
          </button>
          <button onClick={() => advance(false)} className={outlined}>
            {labels.skip}
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2" aria-hidden>
            {Array.from({ length: CYCLE }, (_, i) => (
              <span
                key={i}
                className={`size-2.5 rounded-full border border-(--ink) ${
                  i < done ? "bg-(--ink)" : i === done && mode === "focus" ? "bg-(--ink)/50" : ""
                }`}
              />
            ))}
          </div>
          <p className="text-[12px]">
            {mode === "focus" ? fill(labels.session, Math.min(done + 1, CYCLE)) : fill(labels.sessionsDone, done)}
          </p>
        </div>
      </div>
    </section>
  );
}
