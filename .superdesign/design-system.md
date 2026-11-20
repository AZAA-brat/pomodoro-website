# Pomodoro — design system

## Product
A minimal pomodoro timer. Three pages only: Timer (main), Settings, Profile. Bilingual: English / Russian. Nothing else.
- Timer: modes Focus 25:00 / Short break 05:00 / Long break 15:00, Start/Pause, Reset.
- Settings: background theme (Moss = black-grey-green, Dusk = black-grey-purple-pink), language (English / Русский).
- Profile: display name, completed focus sessions, total focus minutes.

## Type
JetBrains Mono for everything (weights 200, 400, 600). Timer digits: weight 200, clamp(6rem, 22vw, 15rem), tabular numbers, tight tracking (-0.04em). Body 15px/1.5, labels 13px sentence case (never all caps).

## Color — two themes, both start from true black
Moss (black-grey-green):  bg #000000, surface #151816, line #2A2F2C, muted #8A938D, text #E8EDE9, accent #7DDBA3, glow #1F4D36
Dusk (black-grey-purple-pink): bg #000000, surface #17151B, line #2E2A35, muted #938C9C, text #EEE9F2, accent-a #A78BFA (purple), accent-b #F472B6 (pink), glow #3B1E4A
Background: black base, a grey haze in the middle, and one large soft radial glow of the accent hue rising from the bottom edge (Moss: green; Dusk: purple blending into pink).

## Layout
- Single centred column, generous negative space. Content max-width 28rem except the timer digits.
- Timer: mode switch (3 text tabs) → giant digits → a row of 25 thin tick segments showing progress → Start/Pause pill + small Reset icon button.
- Navbar: floating pill docked at bottom centre, 3 icon buttons (timer, settings, profile), active icon in accent with a small dot under it. Language/theme live only in Settings.
- Radius: pill 999px for nav and primary button; 16px for settings rows. No shadows except the accent glow.

## Motion
Only: digits tick; progress ticks fill; nav active state crossfade. Respect prefers-reduced-motion.
