"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineTimer } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { CgProfile } from "react-icons/cg";

type Labels = { timer: string; settings: string; profile: string };

export function Navbar({ lang, labels }: { lang: string; labels: Labels }) {
  const pathname = usePathname();

  const items = [
  {
    href: `/${lang}`,
    label: labels.timer,
    icon: <MdOutlineTimer suppressHydrationWarning />,
  },
  {
    href: `/${lang}/settings`,
    label: labels.settings,
    icon: <IoMdSettings suppressHydrationWarning />,
  },
  {
    href: `/${lang}/profile`,
    label: labels.profile,
    icon: <CgProfile suppressHydrationWarning />,
  },
];

  return (
    <nav className="fixed inset-x-0 bottom-8 flex justify-center px-4">
      <ul className="flex items-center gap-6 rounded-full border border-line bg-surface/80 px-6 py-2 backdrop-blur">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                title={item.label}
                aria-current={active ? "page" : undefined}
                className={`relative flex size-11 items-center justify-center rounded-full text-[22px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active ? "text-accent" : "text-muted hover:text-text"
                }`}
              >
                {item.icon}
                <span
                  className={`absolute bottom-0.5 size-1 rounded-full bg-accent transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
