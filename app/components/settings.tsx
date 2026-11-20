"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { THEME_KEY, type Theme, read, rememberLocale, write } from "../lib/storage";

type Labels = {
  title: string;
  background: string;
  moss: string;
  dusk: string;
  language: string;
};

const swatches: Record<Theme, string> = {
  moss: "linear-gradient(135deg, #000 0%, #2a2f2c 50%, #7ddba3 100%)",
  dusk: "linear-gradient(135deg, #000 0%, #2e2a35 40%, #a78bfa 75%, #f472b6 100%)",
};

const languages = [
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
];

const option =
  "flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Settings({ lang, labels }: { lang: string; labels: Labels }) {
  const [theme, setTheme] = useState<Theme>("moss");

  useEffect(() => {
    const saved = read(THEME_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "moss" || saved === "dusk") setTheme(saved);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    write(THEME_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-10">
      <h1 className="text-2xl font-semibold">{labels.title}</h1>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[13px] text-muted">{labels.background}</legend>
        {(["moss", "dusk"] as Theme[]).map((t) => (
          <button
            key={t}
            onClick={() => choose(t)}
            aria-pressed={theme === t}
            className={`${option} ${theme === t ? "border-accent bg-surface" : "border-line hover:bg-surface"}`}
          >
            <span className="size-8 shrink-0 rounded-full border border-line" style={{ background: swatches[t] }} />
            {labels[t]}
          </button>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[13px] text-muted">{labels.language}</legend>
        {languages.map((l) => (
          <Link
            key={l.code}
            href={`/${l.code}/settings`}
            onClick={() => rememberLocale(l.code)}
            aria-current={lang === l.code ? "true" : undefined}
            className={`${option} ${lang === l.code ? "border-accent bg-surface" : "border-line hover:bg-surface"}`}
          >
            {l.name}
          </Link>
        ))}
      </fieldset>
    </section>
  );
}
