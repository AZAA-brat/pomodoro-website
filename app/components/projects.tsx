"use client";

import { type FormEvent, useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import { TbCategoryMinus, TbCategoryPlus } from "react-icons/tb";
import {
  DEFAULT_TIMER_SETTINGS,
  PROJECT_COLORS,
  type Project,
  readFocusLog,
  readProjects,
  writeProjects,
} from "../lib/storage";

type Labels = {
  title: string;
  create: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  name: string;
  namePlaceholder: string;
  color: string;
  goal: string;
  hours: string;
  focus: string;
  shortBreak: string;
  longBreak: string;
  sessions: string;
  minutes: string;
  decrease: string;
  increase: string;
  today: string;
  empty: string;
};

type NumberField = "goal" | "focus" | "shortBreak" | "longBreak" | "sessions";

const iconButton =
  "flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-xl transition-colors hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const stepButton =
  "flex size-9 shrink-0 items-center justify-center rounded-full border border-text text-lg leading-none transition-colors hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const pillButton =
  "flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[14px] transition-colors hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

// Native colour picker shown as a round swatch.
const swatch =
  "size-10 shrink-0 cursor-pointer rounded-full border border-line bg-transparent p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0";

export function Projects({ labels }: { labels: Labels }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [todayMinutes, setTodayMinutes] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState<Project | null>(null); // form is open while set
  const [editing, setEditing] = useState<string | null>(null); // original name of the project being edited

  useEffect(() => {
    const midnight = new Date().setHours(0, 0, 0, 0);
    const minutes: Record<string, number> = {};
    for (const e of readFocusLog()) if (e.at >= midnight) minutes[e.task] = (minutes[e.task] ?? 0) + e.minutes;
    /* eslint-disable react-hooks/set-state-in-effect */
    setProjects(readProjects());
    setTodayMinutes(minutes);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function save(next: Project[]) {
    setProjects(next);
    writeProjects(next);
  }

  function openForm(project: Project | null) {
    setEditing(project?.name ?? null);
    setDraft(
      project ?? {
        ...DEFAULT_TIMER_SETTINGS,
        name: "",
        goal: 1,
        color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
      },
    );
  }

  function closeForm() {
    setDraft(null);
    setEditing(null);
  }

  const trimmed = draft?.name.trim() ?? "";
  const canSave = trimmed !== "" && !projects.some((p) => p.name === trimmed && p.name !== editing);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft || !canSave) return;
    const project = { ...draft, name: trimmed };
    save(editing === null ? [...projects, project] : projects.map((p) => (p.name === editing ? project : p)));
    closeForm();
  }

  const fields: { key: NumberField; label: string; min: number; max: number; step: number; unit?: string }[] = [
    { key: "goal", label: labels.goal, min: 0.5, max: 24, step: 0.5, unit: labels.hours },
    { key: "focus", label: labels.focus, min: 5, max: 120, step: 5, unit: labels.minutes },
    { key: "shortBreak", label: labels.shortBreak, min: 5, max: 60, step: 5, unit: labels.minutes },
    { key: "longBreak", label: labels.longBreak, min: 5, max: 60, step: 5, unit: labels.minutes },
    { key: "sessions", label: labels.sessions, min: 1, max: 12, step: 1 },
  ];

  return (
    <section className="flex w-full max-w-md flex-col gap-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{labels.title}</h1>
        {!draft && (
          <button type="button" onClick={() => openForm(null)} className={pillButton}>
            <TbCategoryPlus className="text-xl" aria-hidden suppressHydrationWarning />
            {labels.create}
          </button>
        )}
      </div>

      {draft && (
        <form onSubmit={submit} className="flex flex-col gap-6 rounded-2xl border border-line p-4 text-[14px]">
          <div className="flex items-end gap-3">
            <label className="flex flex-1 flex-col gap-2">
              <span>{labels.name}</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder={labels.namePlaceholder}
                maxLength={40}
                autoFocus
                className="rounded-full border border-line bg-surface px-4 py-2 placeholder:text-muted focus-visible:border-accent focus-visible:outline-none"
              />
            </label>
            <input
              type="color"
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
              aria-label={labels.color}
              className={swatch}
            />
          </div>

          <ul className="flex flex-col gap-4">
            {fields.map(({ key, label, min, max, step, unit }) => (
              <li key={key} className="flex items-center justify-between gap-4">
                <span>{label}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, [key]: Math.max(min, draft[key] - step) })}
                    disabled={draft[key] <= min}
                    aria-label={`${labels.decrease}: ${label}`}
                    className={stepButton}
                  >
                    −
                  </button>
                  <output aria-live="polite" className="w-16 text-center font-semibold tabular-nums">
                    {draft[key]}
                    {unit && ` ${unit}`}
                  </output>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, [key]: Math.min(max, draft[key] + step) })}
                    disabled={draft[key] >= max}
                    aria-label={`${labels.increase}: ${label}`}
                    className={stepButton}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeForm} className={pillButton}>
              {labels.cancel}
            </button>
            <button type="submit" disabled={!canSave} className={pillButton}>
              {labels.save}
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        !draft && <p className="text-[14px] text-muted">{labels.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((p) => {
            const done = todayMinutes[p.name] ?? 0;
            const percent = Math.min(100, (done / (p.goal * 60)) * 100);
            return (
              <li key={p.name} className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3 text-[14px]">
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: p.color }} aria-hidden />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex justify-between gap-4">
                    <span className="truncate font-semibold">{p.name}</span>
                    <span className="shrink-0 text-muted tabular-nums">
                      {labels.today}: {(done / 60).toFixed(1)} / {p.goal} {labels.hours}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-line" aria-hidden>
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: p.color }} />
                  </div>
                  <p className="text-[12px] text-muted tabular-nums">
                    {p.focus} / {p.shortBreak} / {p.longBreak} {labels.minutes} · {p.sessions}×
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openForm(p)}
                  aria-label={`${labels.edit}: ${p.name}`}
                  className={iconButton}
                >
                  <MdEdit suppressHydrationWarning />
                </button>
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
