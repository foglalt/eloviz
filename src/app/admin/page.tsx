import Link from "next/link";
import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { isAdminAuthenticated, isAdminAuthConfigured } from "@/lib/admin-auth";
import { listAdminStudies, listAdminTopics, listAdminVideos } from "@/lib/content-repository";
import { loginAction } from "./actions";

type Props = { searchParams: Promise<{ message?: string; error?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const query = await searchParams;
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    const configured = isAdminAuthConfigured();
    return (
      <main className="admin-login">
        <section className="admin-login__panel">
          <p className="eyebrow">Élő Víz</p>
          <h1>Szerkesztői belépés</h1>
          <p>Témák, PDF-tanulmányok, igehelyek és videók kezelése.</p>
          <AdminNotice message={query.message} error={query.error} />
          {!configured ? (
            <div className="admin-config-note">
              <strong>A belépés még nincs beállítva.</strong>
              <p>Add meg az <code>ADMIN_PASSWORD</code> és egy hosszú, véletlen <code>ADMIN_SESSION_SECRET</code> környezeti változót, majd indítsd újra az alkalmazást.</p>
            </div>
          ) : (
            <form action={loginAction} className="admin-login__form">
              <div className="field">
                <label htmlFor="password">Jelszó</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
              </div>
              <button className="button button--primary" type="submit">Belépés</button>
            </form>
          )}
          <Link className="text-link" href="/">Vissza a nyilvános oldalra</Link>
        </section>
      </main>
    );
  }

  const [topics, studies, videos] = await Promise.all([listAdminTopics(), listAdminStudies(), listAdminVideos()]);
  return (
    <AdminShell>
      <div className="admin-heading">
        <div><p className="eyebrow">Áttekintés</p><h1>Tartalomtár</h1></div>
        <p>Az itt véglegesített tartalom azonnal megjelenik a nyilvános oldalon.</p>
      </div>
      <AdminNotice message={query.message} error={query.error} />
      <div className="admin-stat-grid">
        <Link className="admin-stat" href="/admin/temak"><strong>{topics.length}</strong><span>téma</span></Link>
        <Link className="admin-stat" href="/admin/tanulmanyok"><strong>{studies.length}</strong><span>tanulmány</span></Link>
        <Link className="admin-stat" href="/admin/videok"><strong>{videos.length}</strong><span>videó</span></Link>
      </div>
      <section className="admin-panel admin-panel--spaced">
        <h2>Figyelmet igényel</h2>
        <ul className="admin-list">
          {studies.filter((study) => study.documents.length > 0 && !study.referenceReviewed).map((study) => (
            <li key={study.id}><span><strong>{study.title}</strong><small>Feltöltött PDF, még nem véglegesített igehelyek</small></span><Link href={`/admin/tanulmanyok?edit=${study.id}`}>Ellenőrzés →</Link></li>
          ))}
          {!studies.some((study) => study.documents.length > 0 && !study.referenceReviewed) && <li><span>Nincs függőben lévő PDF-ellenőrzés.</span></li>}
        </ul>
      </section>
    </AdminShell>
  );
}
