import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { Projects } from "../../components/projects";

export default async function Page({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <Projects labels={dict.projects} />;
}
