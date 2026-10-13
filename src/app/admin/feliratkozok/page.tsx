import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listNewsletterSubscribers } from "@/lib/newsletter";

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
  const subscribers = await listNewsletterSubscribers();

  return (
    <AdminShell>
      <div className="admin-heading">
        <div><p className="eyebrow">Értesítési lista</p><h1>Feliratkozók</h1></div>
        <p>{subscribers.length} aktív e-mail-cím. Hírlevélküldés még nincs bekapcsolva.</p>
      </div>
      <section className="admin-panel admin-subscriber-panel" aria-labelledby="subscriber-list-title">
        <div className="admin-panel__heading">
          <h2 id="subscriber-list-title">Összegyűjtött címek</h2>
          <span>Legújabb elöl</span>
        </div>
        {subscribers.length ? (
          <div className="admin-subscriber-table-wrap">
            <table className="admin-subscriber-table">
              <thead><tr><th scope="col">E-mail-cím</th><th scope="col">Feliratkozás ideje</th></tr></thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <th scope="row">{subscriber.email}</th>
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
