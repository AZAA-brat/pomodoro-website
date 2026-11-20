# Layouts
## app/layout.tsx (scaffold root layout)
```tsx
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```
No navbar yet. Planned: floating bottom nav with 3 icon links (Timer, Settings, Profile).
