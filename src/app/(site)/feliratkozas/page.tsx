import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";

export const metadata: Metadata = {
  title: "Heti értesítő", description: "Értesülj az Élő Víz új bibliatanulmányairól és videóiról heti egy levélben.",
  alternates: { canonical: "/feliratkozas" }, robots: { index: false, follow: true },
};

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const { result } = await searchParams;
  const confirmed = result === "confirmed";
  return <div className="page-shell newsletter-page"><header className="page-intro"><p className="eyebrow">Élő Víz · Heti értesítő</p><h1>{confirmed ? "Feliratkozásod megerősítve" : "Új tartalmak, heti egy levélben"}</h1><p className="lead">{confirmed ? "Köszönjük! Vasárnap esténként elküldjük az új tanulmányokat és videókat. Ha azon a héten nincs újdonság, nem küldünk levelet." : "Vasárnap esténként összegyűjtjük az új tanulmányokat, sorozatrészeket és videókat. Csak akkor írunk, ha van új olvasnivaló vagy néznivaló."}</p></header>
    {confirmed ? <Link href="/tanulmanyok" className="button">Felfedezem a tanulmányokat</Link> : <>
      {result === "expired" ? <p role="alert">Ez a megerősítő link már nem érvényes, vagy már felhasználtad. Új linket az alábbi űrlapon kérhetsz.</p> : null}
      {result === "error" ? <p role="alert">A megerősítés most nem sikerült. Próbáld meg később újra a levélben kapott linket.</p> : null}
      <NewsletterSignupForm /><p className="newsletter-page__note">A feliratkozás után megerősítő levelet küldünk. E-mail-címedet az értesítőhöz tároljuk; a leveleket a Resend szolgáltatás kézbesíti. Bármelyik értesítő alján leiratkozhatsz.</p>
    </>}
  </div>;
}
