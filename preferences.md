# Preferences & Requirements

## Working style
- Read the relevant existing code before making changes.
- Follow the existing architecture, naming, file organization, and coding style.
- Make the smallest change that fully solves the task.
- No new libraries, dependencies, or patterns unless explicitly requested or clearly necessary.
- If requirements are ambiguous, ask a concise clarifying question before implementing.
- Do not change, alter, or delete files unrelated to the task.
- If an instruction conflicts with an explicit request in the current conversation, follow the request and explain the conflict.

## Tech stack
- React (Next.js) with Tailwind CSS.
- TypeScript only because the project already uses it.
- Package manager: npm.

## Checks before calling work complete
1. `npm run lint`
2. `npm run build`
3. `npm test` if tests exist
- If a command is unavailable, check `package.json` and use the closest one.

## React
- Functional components and hooks.
- Types or interfaces for component props.
- One responsibility per component.
- Reusable logic goes in custom hooks; reusable UI goes in components, not duplicated markup.
- Controlled inputs where practical.
- Never mutate state directly; use setters and immutable updates.
- `useMemo` / `useCallback` only when there is a measurable performance need.
- Handle loading, empty, error, and success states in data-driven UI.
- Accessible semantic HTML: buttons, labels, headings, landmarks, `alt` text.

## Tailwind CSS
- Use utility classes; no custom CSS unless Tailwind can't do it.
- Keep class lists readable; extract repeated complex combinations into a component or constant.
- Responsive utilities (`sm:`, `md:`, `lg:`, `xl:`) for layout changes.
- Use dark-mode utilities consistently if dark mode is supported.
- Use design tokens from the Tailwind config (colors, spacing, typography, radius).
- Avoid arbitrary values like `w-[347px]` unless necessary.

## File organization
- Follow the existing structure. For new files: `components/`, `features/`, `hooks/`, `lib/` or `utils/`, `types/`, `pages/` or `app/`.
- Don't create a new folder or abstraction the project doesn't already use.

## Code quality
- Clear, descriptive names.
- Readable over clever.
- Remove unused imports, variables, styles, and dead code.
- No TODO comments unless requested.
- Never commit secrets, API keys, tokens, or credentials.
- No unrelated changes or unnecessary refactors.

## Git
- The user handles git (add, commit, and so on). Don't run git operations.

## Verification
- Confirm the app compiles.
- Confirm the affected UI renders correctly where possible.
- Check responsive behavior at mobile and desktop widths.
- Check keyboard navigation and basic accessibility for new interactive UI.
- Run lint, typecheck, tests, and build when available.
