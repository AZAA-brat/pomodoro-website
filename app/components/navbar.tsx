"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineTimer } from "react-icons/md";
import { IoMdMenu, IoMdSettings } from "react-icons/io";
import { CgProfile } from "react-icons/cg";

type Labels = { timer: string; settings: string; profile: string };

export function Navbar({ lang, labels }: { lang: string; labels: Labels }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const items = [
    { href: `/${lang}`, label: labels.timer, icon: <MdOutlineTimer suppressHydrationWarning /> },
    { href: `/${lang}/settings`, label: labels.settings, icon: <IoMdSettings suppressHydrationWarning /> },
    { href: `/${lang}/profile`, label: labels.profile, icon: <CgProfile suppressHydrationWarning /> },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="main-nav"
        aria-label="Menu"
        className="fixed top-4 left-4 z-30 rounded-lg bg-neutral-900 p-2 text-2xl text-stone-300 shadow-lg hover:text-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
      >
        <IoMdMenu suppressHydrationWarning />
      </button>

      {open && <div className="fixed inset-0 z-10 bg-black/40" onClick={() => setOpen(false)} aria-hidden />}

      <nav
        id="main-nav"
        className={`fixed inset-y-0 left-0 z-20 w-72 border-r border-white/10 bg-neutral-900 pt-20 font-sans transition-all duration-300 ${
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <ul className="flex flex-col gap-1 px-4">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 text-lg transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500 ${
                    active ? "bg-white/5 text-stone-100" : "text-stone-400 hover:text-stone-100"
                  }`}
                >
                  <span className="text-xl" aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
