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
    <div className="page-shell series-index">
      <header className="page-intro"><p className="eyebrow">Fejezetről fejezetre</p><h1>Sorozatok</h1><p className="lead">Hosszabb tanulmányok önálló részekre bontva. Olvass sorban, vagy válaszd ki a téged érdeklő fejezetet.</p><Link className="text-link" href="/tanulmanyok">Minden tanulmány</Link></header>
      {series.length ? <ul className="series-index-list">{series.map((item) => (
        <li key={item.id}>
          <Link className="series-index-item" href={`/sorozatok/${item.slug}`}>
            <div><h2>{item.title}</h2><p className="meta-line">{item.parts.length} olvasható rész{item.author ? ` · ${item.author}` : ""}</p></div>
            <div className="series-index-item__summary"><p className="preview-description">{item.description}</p><span className="text-link">Tartalomjegyzék</span></div>
          </Link>
        </li>
      ))}</ul> : <p className="empty-state">A sorozatok előkészítés alatt állnak. Hamarosan itt is megjelennek az első részek.</p>}
    </div>
  );
}
