import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import { Timer } from "../components/timer";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <Timer labels={dict.timer} />;
}
