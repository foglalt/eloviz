import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__inner">
          <Link className="admin-brand" href="/admin">Élő Víz · szerkesztőség</Link>
          <nav className="admin-nav" aria-label="Szerkesztői navigáció">
            <Link href="/admin/temak">Témák</Link>
            <Link href="/admin/tanulmanyok">Tanulmányok</Link>
            <Link href="/admin/videok">Videók</Link>
            <Link href="/" target="_blank">Nyilvános oldal ↗</Link>
            <form action={logoutAction}><button className="admin-link-button" type="submit">Kilépés</button></form>
          </nav>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}

export function AdminNotice({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) return null;
  return <p className={`admin-notice${error ? " admin-notice--error" : ""}`} role="status">{error ?? message}</p>;
}
