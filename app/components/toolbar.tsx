"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { THEME_KEY, read, rememberLocale, write } from "../lib/storage";

type Labels = { language: string; darkTheme: string };

const languages = [
  { code: "en", name: "ENG" },
  { code: "ru", name: "RU" },
];

// Language switch and theme toggle, fixed to the top-right corner.
export function Toolbar({ lang, labels }: { lang: string; labels: Labels }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(read(THEME_KEY) !== "light");
  }, []);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    setDark(!dark);
    write(THEME_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <div className="fixed top-4 right-4 z-30 flex items-center gap-2 font-sans">
      <div
        role="group"
        aria-label={labels.language}
        className="flex rounded-lg bg-surface p-1 text-[13px] shadow-lg"
      >
        {languages.map((l) => (
          <Link
            key={l.code}
            href={pathname.replace(/^\/[^/]+/, `/${l.code}`)}
            onClick={() => rememberLocale(l.code)}
            aria-current={lang === l.code ? "true" : undefined}
            className={`rounded-md px-3 py-1.5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              lang === l.code ? "bg-bg/60 text-accent" : "text-muted hover:text-text"
            }`}
          >
            {l.name}
          </Link>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-pressed={dark}
        aria-label={labels.darkTheme}
        className="rounded-lg bg-surface p-2 text-2xl text-muted shadow-lg hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {dark ? <MdDarkMode suppressHydrationWarning /> : <MdLightMode suppressHydrationWarning />}
      </button>
    </div>
  );
}
