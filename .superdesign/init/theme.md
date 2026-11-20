# Theme
## Token summary
Scaffold only: --background #ffffff / dark #0a0a0a, --foreground #171717 / dark #ededed. Fonts Geist / Geist Mono (to be replaced by JetBrains Mono). Tailwind v4 defaults for spacing/radius.
## globals.css
```css
@import "tailwindcss";
:root { --background: #ffffff; --foreground: #171717; }
@theme inline { --color-background: var(--background); --color-foreground: var(--foreground); }
@media (prefers-color-scheme: dark) { :root { --background: #0a0a0a; --foreground: #ededed; } }
body { background: var(--background); color: var(--foreground); }
```
