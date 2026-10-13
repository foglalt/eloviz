import type { Metadata } from "next";
import Link from "next/link";
import { StudyRows } from "@/components/resource-lists";
import { listPublicStudies } from "@/lib/content-repository";

export const metadata: Metadata = {
  title: "Bibliatanulmányok",
  description: "Magyar nyelvű, letölthető PDF-bibliatanulmányok témák és igeszakaszok szerint.",
  alternates: { canonical: "/tanulmanyok" },
};
export default async function StudiesPage() { const studies = await listPublicStudies(); return <div className="page-shell"><header className="page-intro"><p className="eyebrow">Gyűjtemény</p><h1>Bibliatanulmányok</h1><p className="lead">Magyar bibliatanulmányok olvasható szöveggel, letölthető PDF-fel és kapcsolódó igeszakaszokkal.</p><Link className="text-link" href="/sorozatok">Tanulmánysorozatok · fejezetről fejezetre</Link></header><StudyRows studies={studies} /></div>; }
