import type { Metadata } from "next";
import { TopicRows } from "@/components/resource-lists";
import { listPublicTopics } from "@/lib/content-repository";

export const metadata: Metadata = { title: "Bibliai témák", description: "Bibliatanulmányok és videóajánlók bibliai témák szerint rendezve." };

export default async function TopicsPage() {
  const topics = await listPublicTopics();
  return <div className="page-shell"><header className="page-intro"><p className="eyebrow">Témakörök</p><h1>Meríts egy témából</h1><p className="lead">Minden témához rövid eligazítás, önálló PDF-tanulmányok és kapcsolódó videóajánlók tartozhatnak.</p></header><TopicRows topics={topics} /></div>;
}
