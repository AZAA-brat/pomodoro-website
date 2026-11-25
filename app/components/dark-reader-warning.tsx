"use client";

import { useEffect, useState } from "react";

// Dark Reader marks the page with this attribute on <html> and a <meta name="darkreader"> in <head> while it is on.
function darkReaderActive() {
  return (
    document.documentElement.hasAttribute("data-darkreader-mode") ||
    document.querySelector('meta[name="darkreader"]') !== null
  );
}

export function DarkReaderWarning({ message }: { message: string }) {
  const [active, setActive] = useState(false);

  // The extension can be switched on or off at any time, so keep watching instead of checking once.
  useEffect(() => {
    const check = () => setActive(darkReaderActive());
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-darkreader-mode"] });
    observer.observe(document.head, { childList: true });
    return () => observer.disconnect();
  }, []);

  if (!active) return null;

  return (
    <p
      role="alert"
      className="fixed inset-x-4 top-16 z-20 mx-auto max-w-md rounded-2xl border border-line bg-surface px-4 py-3 text-center text-[13px] text-text shadow-lg"
    >
      {message}
    </p>
  );
}
