import type { Metadata } from "next";
import { StudyRows } from "@/components/resource-lists";
import { listPublicStudies } from "@/lib/content-repository";

export const metadata: Metadata = { title: "Bibliatanulmányok", description: "Magyar nyelvű, letölthető PDF-bibliatanulmányok témák és igeszakaszok szerint." };
export default async function StudiesPage() { const studies = await listPublicStudies(); return <div className="page-shell"><header className="page-intro"><p className="eyebrow">Gyűjtemény</p><h1>Bibliatanulmányok</h1><p className="lead">Önálló PDF-anyagok világos leírással és szerkesztő által ellenőrzött bibliai hivatkozásokkal.</p></header><StudyRows studies={studies} /></div>; }
