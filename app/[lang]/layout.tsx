import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "./dictionaries";
import { Navbar } from "../components/navbar";
import { Timer } from "../components/timer";
import { ThemeScript } from "../components/theme-script";
import "../globals.css";
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["200", "400", "600"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "900"],
});

export const metadata: Metadata = {
  title: "Pomodoro",
};

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <head>
        {/* Applies the saved theme before paint so light mode doesn't flash dark. */}
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-mono">
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <Timer lang={lang} labels={dict.timer} />
          {children}
        </main>

        <Navbar lang={lang} labels={dict.nav} />
      </body>
    </html>
  );
}
