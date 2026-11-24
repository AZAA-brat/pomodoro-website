"use client";

import { THEME_KEY } from "../lib/storage";

// Runs from the server HTML before paint; on client renders React 19 warns about executable <script>, so mark it inert there.
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? undefined : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_KEY}")||"dark"}catch(e){}`,
      }}
    />
  );
}
