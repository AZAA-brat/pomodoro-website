import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { Profile } from "../../components/profile";

export default async function Page({ params }: PageProps<"/[lang]/profile">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <Profile labels={dict.profile} />;
}
