import type { Metadata } from "next";
import Link from "next/link";
import {
  isAdminAuthenticated,
  isAdminPasswordConfigured,
} from "@/lib/admin-auth";
import {
  getHusvetQuizContent,
  getQuizStorageStatus,
} from "@/lib/husvet-quiz-store";
import { logoutAdminAction } from "./actions";
import { AdminLoginForm } from "./admin-login-form";
import { AdminQuizEditor } from "./admin-quiz-editor";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin felület a húsvéti kvíz kérdéseinek szerkesztéséhez.",
};

export default async function AdminPage() {
  const storageStatus = getQuizStorageStatus();
  const passwordConfigured = isAdminPasswordConfigured();

  if (!passwordConfigured) {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <div className={styles.noticePanel}>
            <p className={styles.kicker}>Admin</p>
            <h1>Hiányzó hozzáférési beállítás</h1>
            <p>
              Az admin felület használatához állítsd be az
              {" "}
              <code>ADMIN_PASSWORD</code>
              {" "}
              környezeti változót.
            </p>
            <p className={styles.storageNote}>{storageStatus.note}</p>
            <Link className={styles.ghostLink} href="/kviz">
              Vissza a kvízhez
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <div className={styles.loginShell}>
            <div className={styles.noticePanel}>
              <p className={styles.kicker}>Húsvéti kvíz admin</p>
              <h2>Gyors tartalmi szerkesztés</h2>
              <p>
                A publikus kvíz kérdéseit itt tudod frissíteni anélkül, hogy a
                kódot kézzel módosítanád.
              </p>
              <p className={styles.storageNote}>{storageStatus.note}</p>
            </div>

            <AdminLoginForm />
          </div>
        </section>
      </main>
    );
  }

  const quizContent = await getHusvetQuizContent();

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.topbar}>
          <Link className={styles.ghostLink} href="/kviz">
            Publikus kvíz
          </Link>

          <form action={logoutAdminAction}>
            <button className={styles.logoutButton} type="submit">
              Kijelentkezés
            </button>
          </form>
        </div>

        <AdminQuizEditor
          initialContent={quizContent}
          storageStatus={storageStatus}
        />
      </section>
    </main>
  );
}
