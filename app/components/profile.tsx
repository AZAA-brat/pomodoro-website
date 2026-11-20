"use client";

import { useEffect, useState } from "react";
import { MINUTES_KEY, NAME_KEY, SESSIONS_KEY, read, write } from "../lib/storage";

type Labels = {
  title: string;
  name: string;
  namePlaceholder: string;
  sessions: string;
  minutes: string;
};

export function Profile({ labels }: { labels: Labels }) {
  const [name, setName] = useState("");
  const [sessions, setSessions] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setName(read(NAME_KEY) ?? "");
    setSessions(Number(read(SESSIONS_KEY) ?? 0));
    setMinutes(Number(read(MINUTES_KEY) ?? 0));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  return (
    <section className="flex w-full max-w-md flex-col gap-10">
      <h1 className="text-2xl font-semibold">{labels.title}</h1>

      <label className="flex flex-col gap-3">
        <span className="text-[13px] text-muted">{labels.name}</span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            write(NAME_KEY, e.target.value);
          }}
          placeholder={labels.namePlaceholder}
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-[14px] text-text placeholder:text-muted focus-visible:border-accent focus-visible:outline-none"
        />
      </label>

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
    </section>
  );
}
