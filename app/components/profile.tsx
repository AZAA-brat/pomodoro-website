"use client";

import { useEffect, useState } from "react";
import { Stats } from "./stats";
import { MINUTES_KEY, SESSIONS_KEY, read } from "../lib/storage";

type Labels = {
  title: string;
  greeting: string;
  sessions: string;
  minutes: string;
  stats: Parameters<typeof Stats>[0]["labels"];
};

export function Profile({ lang, labels }: { lang: string; labels: Labels }) {
  const [sessions, setSessions] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSessions(Number(read(SESSIONS_KEY) ?? 0));
    setMinutes(Number(read(MINUTES_KEY) ?? 0));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  return (
    <section className="flex w-full max-w-md flex-col gap-10">
      <h1 className="text-2xl font-semibold">{labels.title}</h1>

      <p className="text-xl text-text">{labels.greeting}</p>

      <dl className="grid grid-cols-2 gap-3">
        {[
          { label: labels.sessions, value: sessions },
          { label: labels.minutes, value: minutes },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-2 rounded-2xl border border-line px-4 py-4">
            <dd className="text-4xl font-extralight tabular-nums">{s.value}</dd>
            <dt className="text-[13px] text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>

      <Stats lang={lang} labels={labels.stats} />
    </section>
  );
}
