import type { Metadata } from "next";
import Link from "next/link";
import { confirmNewsletterAction } from "@/app/(site)/newsletter-actions";
import { isConfirmationToken } from "@/lib/newsletter-delivery-core";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Feliratkozás megerősítése", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function ConfirmNewsletterPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <div className="page-shell newsletter-page"><header className="page-intro"><p className="eyebrow">Heti értesítő</p><h1>Feliratkozás megerősítése</h1><p className="lead">{isConfirmationToken(token) ? "A gomb megnyomásával megerősíted, hogy kéred az Élő Víz heti értesítőjét az új tanulmányokról és videókról." : "Ez a megerősítő link nem érvényes. Kérj új levelet a feliratkozási oldalon."}</p></header>
    {isConfirmationToken(token) ? <form action={confirmNewsletterAction}><input type="hidden" name="token" value={token} /><button type="submit" className="button">Megerősítem a feliratkozásomat</button></form> : <Link href="/feliratkozas" className="button">Új megerősítő levelet kérek</Link>}
  </div>;
}
