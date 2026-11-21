# Project Instructions

This project is a React application styled with Tailwind CSS.

## Your role

- Read the relevant existing code before making changes.
- Follow the existing architecture, naming, file organization, and coding style.
- Make the smallest change that fully solves the requested task.
- Do not introduce new libraries, dependencies, or patterns unless explicitly requested or clearly necessary.
- If requirements are ambiguous, ask a concise clarifying question before implementing.

## Tech stack

- React
- Tailwind CSS
- TypeScript: use TypeScript only if the project already uses it
- Package manager: npm (update this if the project uses pnpm, yarn, or bun)

## Commands

Before saying work is complete, run the relevant checks:
1. `npm run lint`
2. `npm run build`
3. `npm test` if tests exist

If a command is unavailable, inspect `package.json` and use the closest available command.

## React conventions

- Use functional components and hooks.
- Use TypeScript interfaces or types for component props when TypeScript is used.
- Keep components focused on one responsibility.
- Extract reusable logic into custom hooks.
- Extract reusable UI into components rather than duplicating markup.
- Use controlled inputs where practical.
- Do not mutate state directly; use state setters and immutable updates.
- Prefer `useMemo` and `useCallback` only when there is a measurable performance need.
- Handle loading, empty, error, and success states in data-driven UI.
- Use accessible semantic HTML: buttons, labels, headings, landmarks, and `alt` text where appropriate.

## Tailwind CSS conventions

- Use Tailwind utility classes for styling.
- Do not write custom CSS unless a Tailwind utility or configuration cannot accomplish it.
- Keep class lists readable; extract repeated complex class combinations into a component or constant when helpful.
- Use responsive utilities such as `sm:`, `md:`, `lg:`, and `xl:` for layout changes.
- Use dark-mode utilities consistently if dark mode is supported.
- Use design tokens from the Tailwind configuration where available, such as theme colors, spacing, typography, and border radius.
- Avoid arbitrary values such as `w-[347px]` unless necessary; prefer standard Tailwind scale values.

## File organization

Follow the existing structure. If creating new files, use this pattern:

- `src/components/` — reusable UI components
- `src/features/` — feature-specific components and logic
- `src/hooks/` — custom React hooks
- `src/lib/` or `src/utils/` — helpers and shared logic
- `src/types/` — shared TypeScript types
- `src/pages/` or `src/app/` — routes and page-level components

Do not create a new folder or abstraction unless the project already follows that pattern.

## Code quality

- Write clear, descriptive names for components, functions, variables, and files.
- Prefer readable code over clever code.
- Remove unused imports, variables, styles, and dead code.
- Do not leave TODO comments unless the user requests them.
- Do not commit secrets, API keys, tokens, or credentials.
- Do not modify unrelated files or refactor code unnecessarily.

## Git and delivery

- I will add, commit and do other work related with git

## Verification

After implementing a change:

- Confirm the app compiles.
- Confirm affected UI renders correctly where possible.
- Check responsive behavior at mobile and desktop widths.
- Check keyboard navigation and basic accessibility for new interactive UI.
- Run lint, typecheck, tests, and build when available.

## Important rule

Always follow these instructions. If an instruction conflicts with an explicit user request in the current conversation, follow the user request and explain the conflict.