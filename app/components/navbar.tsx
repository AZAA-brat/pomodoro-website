"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineTimer } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { CgProfile } from "react-icons/cg";

type Labels = { timer: string; settings: string; profile: string };

// Gradient ring: white fill on padding-box, cyan→lime gradient showing through the transparent border.
const activeRing =
  "border-2 border-transparent text-slate-900 shadow-[inset_0_0_10px_rgba(103,232,249,0.55)] [background:linear-gradient(#f5feff,#f5feff)_padding-box,linear-gradient(90deg,#67e8f9,#ecfeff,#d9f99d)_border-box]";

export function Navbar({ lang, labels }: { lang: string; labels: Labels }) {
  const pathname = usePathname();

  const items = [
    { href: `/${lang}`, label: labels.timer, icon: <MdOutlineTimer suppressHydrationWarning /> },
    { href: `/${lang}/settings`, label: labels.settings, icon: <IoMdSettings suppressHydrationWarning /> },
    { href: `/${lang}/profile`, label: labels.profile, icon: <CgProfile suppressHydrationWarning /> },
  ];

  return (
    <nav className="fixed inset-x-0 top-6 z-10 flex justify-center px-4">
      <ul className="flex items-center gap-1 rounded-full border border-white/70 bg-cyan-50 p-1.5 font-sans shadow-xl shadow-slate-500/25">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 sm:px-5 sm:text-base ${
                  active ? activeRing : "border-2 border-transparent text-slate-500 hover:text-slate-900"
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
  );
}
