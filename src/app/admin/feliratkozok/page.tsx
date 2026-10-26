import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listNewsletterSubscribers } from "@/lib/newsletter";
import { newsletterOverview } from "@/lib/newsletter-digest";
import { newsletterConfiguration } from "@/lib/newsletter-provider";
import { renderDigest } from "@/lib/newsletter-delivery-core";
import { newsletterHumanCheckConfigured } from "@/lib/newsletter-human";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("hu-HU", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Budapest",
});

export default async function NewsletterSubscribersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const [subscribers, overview] = await Promise.all([listNewsletterSubscribers(), newsletterOverview()]);
  const configuration = newsletterConfiguration();
  const humanCheckConfigured = newsletterHumanCheckConfigured();
  const active = Number(overview.counts.find((row) => row.status === "subscribed")?.count ?? 0);
  const statusLabels: Record<string, string> = { pending: "Megerősítésre vár", subscribed: "Aktív", unsubscribed: "Leiratkozott", preparing: "Előkészítés", creating: "Levél létrehozása", draft: "Piszkozat", sending: "Küldés", sent: "Küldés elfogadva", skipped: "Kihagyva", failed: "Sikertelen", review: "Ellenőrzést igényel" };

  return (
    <AdminShell>
      <div className="admin-heading">
        <div><p className="eyebrow">Értesítési lista</p><h1>Feliratkozók</h1></div>
        <p>{active} aktív e-mail-cím. {configuration.enabled ? "Heti értesítő bekapcsolva · vasárnap este." : "A heti értesítő beállítása még folyamatban van."}</p>
      </div>
      <section className="admin-panel newsletter-admin-panel" aria-labelledby="newsletter-delivery-title">
        <h2 id="newsletter-delivery-title">Heti értesítő</h2>
        <p>Az új, közzétett tanulmányokat, sorozatrészeket és videókat gyűjtjük össze. Ha nincs újdonság vagy megerősített feliratkozó, nem küldünk levelet.</p>
        <p role="status">{humanCheckConfigured ? "Robotvédelem: Cloudflare Turnstile · az új feliratkozásokhoz emberi ellenőrzés és e-mailes megerősítés szükséges." : "Az új feliratkozások szünetelnek, amíg a Cloudflare emberi ellenőrzés nincs beállítva. A meglévő feliratkozók heti értesítője változatlanul működik."}</p>
        <p>Resend Marketing: az ingyenes csomag 1000 névjegyet és korlátlan hírlevélküldést tartalmaz. A megerősítő levelek külön kerete napi 100, havi 3000 levél; az oldal legfeljebb napi 80 megerősítést indít. A keretek a teljes Resend-fiókra vonatkoznak.</p>
        {!configuration.enabled ? <p role="status">A küldéshez teljes hozzáférésű Resend-kulcs, ellenőrzött feladó, külön értesítési lista és leiratkozási kapcsolat szükséges. Beállítás után az automatikus küldést külön kapcsoljuk be.</p> : null}
      </section>
      <section className="admin-panel newsletter-admin-panel" aria-labelledby="newsletter-export-title">
        <h2 id="newsletter-export-title">Adatok mentése szolgáltatóváltáshoz</h2>
        <p>A mentés minden feliratkozást, a hozzájárulás és megerősítés idejét, a leiratkozásokat, a Resend által letiltott címeket és a küldési előzményeket tartalmazza. A még meg nem erősített és letiltott címek külön jelölést kapnak.</p>
        <p><a className="button" href="/admin/feliratkozok/export">Teljes mentés letöltése</a></p>
        <p>A mentés nem vált szolgáltatót és nem küld levelet. A tényleges váltás előtt szüneteltetni kell a küldést, és újra ellenőrizni kell a legfrissebb leiratkozásokat.</p>
      </section>
      <section className="admin-panel newsletter-admin-panel" aria-labelledby="newsletter-preview-title">
        <h2 id="newsletter-preview-title">A következő értesítő előnézete</h2>
        <p>A hét közben közzétett új tartalmakkal bővül. Következő zárás: {dateFormat.format(overview.end)}.</p>
        {overview.items.length ? <iframe className="newsletter-preview" title="Heti értesítő előnézete" sandbox="" srcDoc={renderDigest(overview.items, overview.end).html} /> : <p>Egyelőre nincs új tartalom erre a hétre.</p>}
      </section>
      <section className="admin-panel newsletter-admin-panel" aria-labelledby="newsletter-history-title">
        <h2 id="newsletter-history-title">Küldési előzmények</h2>
        {overview.runs.length ? <ul className="newsletter-run-list">{overview.runs.map((run) => <li key={String(run.id)}><strong>{dateFormat.format(new Date(String(run.period_end)))} · {statusLabels[String(run.status)]}</strong>{run.note ? <p>{String(run.note)}</p> : null}{run.broadcast_id ? <a className="text-link" href={`https://resend.com/broadcasts/${encodeURIComponent(String(run.broadcast_id))}`} target="_blank" rel="noreferrer">Megnyitás a Resendben</a> : null}</li>)}</ul> : <p>Még nem indult heti értesítő.</p>}
      </section>
      <section className="admin-panel admin-subscriber-panel" aria-labelledby="subscriber-list-title">
        <div className="admin-panel__heading">
          <h2 id="subscriber-list-title">Feliratkozások</h2>
          <span>A legújabb 100 cím</span>
        </div>
        {subscribers.length ? (
          <div className="admin-subscriber-table-wrap">
            <table className="admin-subscriber-table">
              <thead><tr><th scope="col">E-mail-cím</th><th scope="col">Állapot</th><th scope="col">Kérés ideje</th></tr></thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <th scope="row">{subscriber.email}</th>
                    <td>{statusLabels[subscriber.status]}</td>
                    <td>{dateFormat.format(subscriber.consentedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="admin-subscriber-empty">Még nincs feliratkozó.</p>}
      </section>
    </AdminShell>
  );
}
