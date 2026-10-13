import type { Metadata } from "next";
import Link from "next/link";
import { listPublicSeries } from "@/lib/study-series-repository";

export const metadata: Metadata = {
  title: "Tanulmánysorozatok",
  description: "Fejezetekre bontott magyar bibliatanulmányok, áttekinthető tartalomjegyzékkel és olvasási sorrenddel.",
  alternates: { canonical: "/sorozatok" },
};
export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  const series = await listPublicSeries();
  return (
    <div className="page-shell">
      <header className="page-intro"><p className="eyebrow">Fejezetről fejezetre</p><h1>Tanulmánysorozatok</h1><p className="lead">Hosszabb tanulmányok önálló részekre bontva. Olvass sorban, vagy válaszd ki a téged érdeklő fejezetet.</p><Link className="text-link" href="/tanulmanyok">Minden tanulmány</Link></header>
      {series.length ? <div className="resource-list">{series.map((item) => (
        <Link key={item.id} className="resource-item" href={`/sorozatok/${item.slug}`}>
          <span><h2>{item.title}</h2><span className="meta-line">{item.parts.length} olvasható rész{item.author ? ` · ${item.author}` : ""}</span></span>
          <span className="resource-item__summary"><span className="preview-description">{item.description}</span><span className="text-link">Tartalomjegyzék</span></span>
        </Link>
      ))}</div> : <p className="empty-state">A sorozatok előkészítés alatt állnak. Hamarosan itt is megjelennek az első részek.</p>}
    </div>
  );
}
