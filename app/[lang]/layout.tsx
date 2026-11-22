import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "./dictionaries";
import { Navbar } from "../components/navbar";
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

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="moss"||t==="dusk")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

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
      data-theme="moss"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${archivo.variable} h-full antialiased`}
    >
  <head>
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  </head>
      <body className="min-h-full flex flex-col font-mono">
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          {children}
        </main>
        <Navbar lang={lang} labels={dict.nav} />
      </body>
    </html>
  );
}
