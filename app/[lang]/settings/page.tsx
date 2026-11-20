import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { Settings } from "../../components/settings";

export default async function Page({ params }: PageProps<"/[lang]/settings">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <Settings lang={lang} labels={dict.settings} />;
}
