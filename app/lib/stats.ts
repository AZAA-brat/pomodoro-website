import type { FocusEntry } from "./storage";

export type Period = "day" | "week" | "weeks8" | "month" | "year";

// `label` is the short axis text (may be empty); `name` is the full text for screen readers.
export type Bucket = { start: Date; end: Date; label: string; name: string };

export type Range = { start: Date; end: Date; title: string; buckets: Bucket[] };

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfDay(date: Date) {
  return addDays(date, 0);
}

// Weeks start on Monday.
function startOfWeek(date: Date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}

function dailyBuckets(start: Date, count: number, label: (d: Date) => string, lang: string): Bucket[] {
  const full = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long" });
  return Array.from({ length: count }, (_, i) => {
    const day = addDays(start, i);
    return { start: day, end: addDays(day, 1), label: label(day), name: full.format(day) };
  });
}

// `offset` is 0 for the period containing `now`, -1 for the one before, and so on.
export function periodRange(period: Period, offset: number, now: Date, lang: string): Range {
  const shortDate = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" });

  if (period === "day") {
    const start = addDays(startOfDay(now), offset);
    const title = new Intl.DateTimeFormat(lang, { weekday: "short", day: "numeric", month: "short" }).format(start);
    return { start, end: addDays(start, 1), title, buckets: [] };
  }

  if (period === "week") {
    const start = addDays(startOfWeek(now), 7 * offset);
    const end = addDays(start, 7);
    const weekday = new Intl.DateTimeFormat(lang, { weekday: "narrow" });
    return {
      start,
      end,
      title: shortDate.formatRange(start, addDays(end, -1)),
      buckets: dailyBuckets(start, 7, (d) => weekday.format(d), lang),
    };
  }

  if (period === "weeks8") {
    const start = addDays(startOfWeek(now), 7 * (8 * offset - 7));
    const end = addDays(start, 56);
    const numeric = new Intl.DateTimeFormat(lang, { day: "numeric", month: "numeric" });
    const buckets = Array.from({ length: 8 }, (_, i) => {
      const weekStart = addDays(start, 7 * i);
      const weekEnd = addDays(weekStart, 7);
      return {
        start: weekStart,
        end: weekEnd,
        label: numeric.format(weekStart),
        name: shortDate.formatRange(weekStart, addDays(weekEnd, -1)),
      };
    });
    return { start, end, title: shortDate.formatRange(start, addDays(end, -1)), buckets };
  }

  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const days = Math.round((end.getTime() - start.getTime()) / DAY_MS);
    return {
      start,
      end,
      title: new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(start),
      // Label every 7th day so 31 bars stay readable.
      buckets: dailyBuckets(start, days, (d) => ((d.getDate() - 1) % 7 === 0 ? String(d.getDate()) : ""), lang),
    };
  }

  const start = new Date(now.getFullYear() + offset, 0, 1);
  const end = new Date(start.getFullYear() + 1, 0, 1);
  const narrow = new Intl.DateTimeFormat(lang, { month: "narrow" });
  const long = new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" });
  const buckets = Array.from({ length: 12 }, (_, i) => {
    const monthStart = new Date(start.getFullYear(), i, 1);
    return { start: monthStart, end: new Date(start.getFullYear(), i + 1, 1), label: narrow.format(monthStart), name: long.format(monthStart) };
  });
  return { start, end, title: String(start.getFullYear()), buckets };
}

export function minutesBetween(log: FocusEntry[], start: Date, end: Date) {
  return log.reduce((sum, e) => (e.at >= start.getTime() && e.at < end.getTime() ? sum + e.minutes : sum), 0);
}

// Days of the range up to and including today; used for the per-day average.
export function elapsedDays(range: Range, now: Date) {
  const until = Math.min(range.end.getTime(), addDays(startOfDay(now), 1).getTime());
  return Math.max(1, Math.round((until - range.start.getTime()) / DAY_MS));
}

// Minutes per task inside the range, largest first; an empty task is keyed "".
export function minutesByTask(log: FocusEntry[], start: Date, end: Date) {
  const totals = new Map<string, number>();
  for (const e of log) {
    if (e.at >= start.getTime() && e.at < end.getTime()) totals.set(e.task, (totals.get(e.task) ?? 0) + e.minutes);
  }
  return [...totals].map(([task, minutes]) => ({ task, minutes })).sort((a, b) => b.minutes - a.minutes);
}

export function formatDuration(minutes: number, lang: string) {
  const unit = (value: number, unit: "hour" | "minute") =>
    new Intl.NumberFormat(lang, { style: "unit", unit, unitDisplay: "narrow" }).format(value);
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  return hours > 0 ? `${unit(hours, "hour")} ${unit(rounded % 60, "minute")}` : unit(rounded, "minute");
}
