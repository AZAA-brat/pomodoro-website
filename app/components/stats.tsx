"use client";

import { useEffect, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { type FocusEntry, readFocusLog } from "../lib/storage";
import {
  type Bucket,
  type Period,
  elapsedDays,
  formatDuration,
  minutesBetween,
  minutesByTask,
  periodRange,
} from "../lib/stats";

type Labels = {
  title: string;
  periods: string;
  day: string;
  week: string;
  weeks8: string;
  month: string;
  year: string;
  previous: string;
  next: string;
  perDay: string;
  noTask: string;
  other: string;
  empty: string;
};

const PERIODS: Period[] = ["day", "week", "weeks8", "month", "year"];

// Donut slice colours; the last one is used for the grouped "other" slice.
const SLICE_COLORS = ["var(--accent)", "#f2b33a", "#e5675a", "#5aa9e6", "#b38ce0", "var(--muted)"];

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const navButton =
  "flex size-9 items-center justify-center rounded-full border border-line text-xl transition-colors hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Stats({ lang, labels }: { lang: string; labels: Labels }) {
  const [log, setLog] = useState<FocusEntry[]>([]);
  // Set after mount so dates use the visitor's clock and timezone, not the server's.
  const [now, setNow] = useState<Date | null>(null);
  const [period, setPeriod] = useState<Period>("day");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLog(readFocusLog());
    setNow(new Date());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const segment = (active: boolean) =>
    `flex-1 rounded-xl px-2 py-2 font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
      active ? "bg-surface text-accent" : "text-muted hover:text-text"
    }`;

  const range = now && periodRange(period, offset, now, lang);
  const total = range ? minutesBetween(log, range.start, range.end) : 0;

  return (
    <section aria-labelledby="stats-title" className="flex flex-col gap-5 rounded-2xl border border-line p-4">
      <h2 id="stats-title" className="text-[13px] tracking-widest text-muted uppercase">
        {labels.title}
      </h2>

      <div role="group" aria-label={labels.periods} className="flex rounded-2xl border border-line p-1 text-[12px]">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={period === p}
            onClick={() => {
              setPeriod(p);
              setOffset(0);
            }}
            className={segment(period === p)}
          >
            {labels[p]}
          </button>
        ))}
      </div>

      {range && now && (
        <>
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => setOffset(offset - 1)} aria-label={labels.previous} className={navButton}>
              <MdChevronLeft />
            </button>
            <p aria-live="polite" className="text-[14px]">
              {range.title}
            </p>
            <button
              type="button"
              onClick={() => setOffset(offset + 1)}
              disabled={offset >= 0}
              aria-label={labels.next}
              className={navButton}
            >
              <MdChevronRight />
            </button>
          </div>

          {total === 0 ? (
            <p className="py-16 text-center text-[13px] text-muted">{labels.empty}</p>
          ) : period === "day" ? (
            <TaskBreakdown
              tasks={minutesByTask(log, range.start, range.end)}
              total={total}
              lang={lang}
              labels={labels}
            />
          ) : (
            <>
              <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-semibold tabular-nums">{formatDuration(total, lang)}</p>
                <p className="text-[13px] text-muted">
                  {formatDuration(total / elapsedDays(range, now), lang)} / {labels.perDay}
                </p>
              </div>
              <BarChart
                bars={range.buckets.map((b) => ({ bucket: b, minutes: minutesBetween(log, b.start, b.end) }))}
                lang={lang}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}

function BarChart({ bars, lang }: { bars: { bucket: Bucket; minutes: number }[]; lang: string }) {
  const max = Math.max(...bars.map((b) => b.minutes));
  const showValues = bars.length <= 8;

  return (
    <ul className="flex h-48 items-end gap-1">
      {bars.map(({ bucket, minutes }) => (
        <li key={bucket.start.getTime()} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className="sr-only">
            {bucket.name}: {formatDuration(minutes, lang)}
          </span>
          {showValues && minutes > 0 && (
            <span aria-hidden className="text-[10px] text-muted tabular-nums">
              {Math.floor(minutes / 60)}:{String(minutes % 60).padStart(2, "0")}
            </span>
          )}
          <div
            aria-hidden
            className={`w-full max-w-8 rounded-t-md ${minutes > 0 ? "bg-accent" : "bg-line"}`}
            style={{ height: minutes > 0 ? `${(minutes / max) * 100}%` : "2px" }}
          />
          <span aria-hidden className="h-4 text-[11px] text-muted">
            {bucket.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TaskBreakdown({
  tasks,
  total,
  lang,
  labels,
}: {
  tasks: { task: string; minutes: number }[];
  total: number;
  lang: string;
  labels: Labels;
}) {
  // Top five tasks get their own slice; the rest are grouped.
  const rest = tasks.slice(5).reduce((sum, t) => sum + t.minutes, 0);
  const slices = [
    ...tasks.slice(0, 5).map((t) => ({ name: t.task || labels.noTask, minutes: t.minutes })),
    ...(rest > 0 ? [{ name: labels.other, minutes: rest }] : []),
  ].map((s, i, all) => ({
    ...s,
    color: SLICE_COLORS[rest > 0 && i === all.length - 1 ? SLICE_COLORS.length - 1 : i],
    before: all.slice(0, i).reduce((sum, p) => sum + p.minutes, 0),
  }));

  return (
    <>
      <div className="relative mx-auto aspect-square w-full max-w-56">
        <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
          {slices.map((s, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke={s.color}
              strokeWidth="28"
              strokeDasharray={`${(s.minutes / total) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={(-s.before / total) * CIRCUMFERENCE}
              transform="rotate(-90 100 100)"
            />
          ))}
        </svg>
        <p className="absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums">
          {formatDuration(total, lang)}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {slices.map((s, i) => (
          <li key={i} className="flex flex-col gap-1.5 text-[13px]">
            <div className="flex justify-between gap-4">
              <span className="truncate">{s.name}</span>
              <span className="shrink-0 text-muted tabular-nums">
                {Math.round((s.minutes / total) * 100)}% · {formatDuration(s.minutes, lang)}
              </span>
            </div>
            <div
              aria-hidden
              className="h-1.5 rounded-full"
              style={{ width: `${(s.minutes / slices[0].minutes) * 100}%`, backgroundColor: s.color }}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
