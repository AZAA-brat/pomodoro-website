"use client";

import { type FormEvent, useEffect, useState } from "react";
import { TbCategoryMinus, TbCategoryPlus } from "react-icons/tb";
import { PROJECT_COLORS, type Project, readFocusLog, readProjects, writeProjects } from "../lib/storage";

type Labels = {
  title: string;
  name: string;
  namePlaceholder: string;
  goal: string;
  hours: string;
  add: string;
  delete: string;
  color: string;
  today: string;
  empty: string;
};

const iconButton =
  "flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-xl transition-colors hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

// Native colour picker shown as a round swatch.
const swatch =
  "size-10 shrink-0 cursor-pointer rounded-full border border-line bg-transparent p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0";

const field =
  "rounded-full border border-line bg-surface px-4 py-2 text-[14px] placeholder:text-muted focus-visible:border-accent focus-visible:outline-none";

export function Projects({ labels }: { labels: Labels }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [todayMinutes, setTodayMinutes] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(1);
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  useEffect(() => {
    const midnight = new Date().setHours(0, 0, 0, 0);
    const minutes: Record<string, number> = {};
    for (const e of readFocusLog()) if (e.at >= midnight) minutes[e.task] = (minutes[e.task] ?? 0) + e.minutes;
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = readProjects();
    setProjects(saved);
    setColor(PROJECT_COLORS[saved.length % PROJECT_COLORS.length]);
    setTodayMinutes(minutes);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function save(next: Project[]) {
    setProjects(next);
    writeProjects(next);
  }

  const trimmed = name.trim();
  const canAdd = trimmed !== "" && goal > 0 && !projects.some((p) => p.name === trimmed);

  function add(e: FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    save([...projects, { name: trimmed, goal, color }]);
    setName("");
    setGoal(1);
    setColor(PROJECT_COLORS[(projects.length + 1) % PROJECT_COLORS.length]);
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-10">
      <h1 className="text-2xl font-semibold">{labels.title}</h1>

      <form onSubmit={add} className="flex items-end gap-3 text-[14px]">
        <label className="flex flex-1 flex-col gap-2">
          <span>{labels.name}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={labels.namePlaceholder}
            maxLength={40}
            className={field}
          />
        </label>
        <label className="flex w-24 flex-col gap-2">
          <span>
            {labels.goal} ({labels.hours})
          </span>
          <input
            type="number"
            min={0.5}
            max={24}
            step={0.5}
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className={`${field} tabular-nums`}
          />
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label={labels.color}
          className={swatch}
        />
        <button type="submit" disabled={!canAdd} aria-label={labels.add} className={iconButton}>
          <TbCategoryPlus suppressHydrationWarning />
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="text-[14px] text-muted">{labels.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((p) => {
            const done = todayMinutes[p.name] ?? 0;
            const percent = Math.min(100, (done / (p.goal * 60)) * 100);
            return (
              <li key={p.name} className="flex items-center gap-4 rounded-2xl border border-line px-4 py-3 text-[14px]">
                <input
                  type="color"
                  value={p.color}
                  onChange={(e) => save(projects.map((q) => (q === p ? { ...q, color: e.target.value } : q)))}
                  aria-label={`${labels.color}: ${p.name}`}
                  className={swatch}
                />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-muted tabular-nums">
                      {labels.today}: {(done / 60).toFixed(1)} / {p.goal} {labels.hours}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-line" aria-hidden>
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: p.color }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => save(projects.filter((q) => q !== p))}
                  aria-label={`${labels.delete}: ${p.name}`}
                  className={iconButton}
                >
                  <TbCategoryMinus suppressHydrationWarning />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
