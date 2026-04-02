import type { Metadata } from "next";
import Link from "next/link";
import {
  isAdminAuthenticated,
  isAdminPasswordConfigured,
} from "@/lib/admin-auth";
import { formatHuTimestamp } from "@/lib/date-utils";
import {
  getInterestStorageStatus,
  listHusvetInterestContacts,
  type HusvetInterestContact,
} from "@/lib/husvet-interest-store";
import {
  getQuizAnalyticsStorageStatus,
  listHusvetQuizDeviceProgress,
  type HusvetQuizDeviceProgress,
} from "@/lib/husvet-quiz-analytics-store";
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
  description: "Admin felület a húsvéti kvíz kérdéseinek és érdeklődőinek követéséhez.",
};

function formatDeviceSuccess(device: HusvetQuizDeviceProgress) {
  const denominator = device.isComplete ? device.totalQuestions : device.answeredCount;

  if (denominator <= 0) {
    return "Még nincs válasz";
  }

  return `${device.correctAnswers}/${denominator} helyes`;
}

function formatDeviceProgress(device: HusvetQuizDeviceProgress) {
  if (device.totalQuestions <= 0) {
    return "Még nincs követhető kérdésszám";
  }

  return `${device.answeredCount}/${device.totalQuestions} megválaszolva`;
}

function getContactHeadline(contact: HusvetInterestContact) {
  if (contact.name.trim()) {
    return contact.name;
  }

  return "Név nélküli érdeklődő";
}

function getSourceLabel(source: HusvetInterestContact["source"]) {
  return source === "quiz" ? "Kvíz" : "Idővonal";
}

export default async function AdminPage() {
  const storageStatus = getQuizStorageStatus();
  const interestStorageStatus = getInterestStorageStatus();
  const analyticsStorageStatus = getQuizAnalyticsStorageStatus();
  const passwordConfigured = isAdminPasswordConfigured();

  if (!passwordConfigured) {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <div className={styles.noticePanel}>
            <p className={styles.kicker}>Admin</p>
            <h1>Hiányzó hozzáférési beállítás</h1>
            <p>
              Az admin felület használatához állítsd be az <code>ADMIN_PASSWORD</code>{" "}
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

  const [quizContent, contacts, quizDevices] = await Promise.all([
    getHusvetQuizContent(),
    listHusvetInterestContacts(),
    listHusvetQuizDeviceProgress(),
  ]);
  const completedDeviceCount = quizDevices.filter((device) => device.isComplete).length;
  const activeDeviceCount = quizDevices.filter(
    (device) => !device.isComplete && device.answeredCount > 0,
  ).length;

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

        <section className={styles.dashboardGrid}>
          <section className={styles.dataPanel}>
            <div className={styles.sectionHeading}>
              <h2>Kvíz eszközök és haladás</h2>
              <p>
                Itt látszik, hány egyedi eszköz járt a kvízen, hol tartanak, és
                eddig mennyire sikerült a kitöltés.
              </p>
            </div>

            <div className={styles.metricsGrid}>
              <article className={styles.metricCard}>
                <span className={styles.metricLabel}>Látott eszközök</span>
                <strong className={styles.metricValue}>{quizDevices.length}</strong>
              </article>

              <article className={styles.metricCard}>
                <span className={styles.metricLabel}>Befejezett kvízek</span>
                <strong className={styles.metricValue}>{completedDeviceCount}</strong>
              </article>

              <article className={styles.metricCard}>
                <span className={styles.metricLabel}>Folyamatban</span>
                <strong className={styles.metricValue}>{activeDeviceCount}</strong>
              </article>
            </div>

            <p className={styles.storageNote}>{analyticsStorageStatus.note}</p>

            {quizDevices.length > 0 ? (
              <div className={styles.insightList}>
                {quizDevices.map((device, index) => (
                  <article className={styles.insightCard} key={device.deviceId}>
                    <div className={styles.insightHeader}>
                      <div className={styles.insightTitleBlock}>
                        <h3>Eszköz {(index + 1).toString().padStart(2, "0")}</h3>
                        <p className={styles.insightMeta}>
                          Azonosító: {device.deviceId.slice(0, 12)}
                          {device.deviceId.length > 12 ? "..." : ""}
                        </p>
                      </div>

                      <span className={styles.sourceBadge}>
                        {device.isComplete ? "Befejezve" : "Folyamatban"}
                      </span>
                    </div>

                    <div className={styles.insightStats}>
                      <p>
                        <span>Haladás</span>
                        <strong>{formatDeviceProgress(device)}</strong>
                      </p>
                      <p>
                        <span>Siker</span>
                        <strong>{formatDeviceSuccess(device)}</strong>
                      </p>
                      <p>
                        <span>Utolsó aktivitás</span>
                        <strong>{formatHuTimestamp(device.lastSeenAt)}</strong>
                      </p>
                    </div>

                    <p className={styles.deviceNote}>
                      {device.userAgent.trim()
                        ? device.userAgent
                        : "A böngésző nem adott át eszközleírást."}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                {analyticsStorageStatus.configured
                  ? "Még nem érkezett eszközadat a kvízről."
                  : "Az eszközstatisztika megjelenítéséhez állítsd be a DATABASE_URL környezeti változót."}
              </p>
            )}
          </section>

          <section className={styles.dataPanel}>
            <div className={styles.sectionHeading}>
              <h2>Kapcsolatot kérők</h2>
              <p>
                A következő listában látszanak azok, akik a kvíz vagy az idővonal
                végén kértek visszajelzést.
              </p>
            </div>

            <div className={styles.metricsGrid}>
              <article className={styles.metricCard}>
                <span className={styles.metricLabel}>Kapcsolatok</span>
                <strong className={styles.metricValue}>{contacts.length}</strong>
              </article>
            </div>

            <p className={styles.storageNote}>{interestStorageStatus.note}</p>

            {contacts.length > 0 ? (
              <div className={styles.insightList}>
                {contacts.map((contact) => (
                  <article className={styles.insightCard} key={contact.id}>
                    <div className={styles.insightHeader}>
                      <div className={styles.insightTitleBlock}>
                        <h3>{getContactHeadline(contact)}</h3>
                        <p className={styles.insightMeta}>
                          {formatHuTimestamp(contact.createdAt)}
                        </p>
                      </div>

                      <span className={styles.sourceBadge}>
                        {getSourceLabel(contact.source)}
                      </span>
                    </div>

                    <div className={styles.contactStack}>
                      <p className={styles.contactValue}>{contact.contact}</p>
                      {contact.note.trim() ? (
                        <p className={styles.contactNote}>{contact.note}</p>
                      ) : (
                        <p className={styles.contactNote}>
                          Nem hagyott külön üzenetet.
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                {interestStorageStatus.configured
                  ? "Még nincs rögzített kapcsolatfelvételi kérés."
                  : "A kapcsolatfelvételi listához állítsd be a DATABASE_URL környezeti változót."}
              </p>
            )}
          </section>
        </section>

        <AdminQuizEditor
          initialContent={quizContent}
          storageStatus={storageStatus}
        />
      </section>
    </main>
  );
}
