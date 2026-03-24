import type { Metadata } from "next";
import Link from "next/link";
import { husvetSite } from "../_content/husvet-site";
import styles from "./quiz-page.module.css";

export const metadata: Metadata = {
  title: "Húsvéti kvíz",
  description:
    "Előkészített kvízfelület a husvet.eloviz.hu húsvéti anyagaihoz.",
};

export default function HusvetQuizPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>{husvetSite.domain} / kvíz</p>
        <h1>Húsvéti kvíz</h1>
        <p className={styles.lead}>
          A kvíz útvonala és a tartalmi helye már elő van készítve. A következő
          iterációban ide kerülnek a kérdésblokkok, az eredményértékelés és a
          kapcsolódó igehelyek.
        </p>

        <ul className={styles.list}>
          <li>Több kérdésblokk és fokozatos nehézségi szintek.</li>
          <li>Bibliai hivatkozásokkal kísért magyarázó válaszok.</li>
          <li>Olyan eredményoldal, amely további olvasnivalót is ajánl.</li>
        </ul>

        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/">
            Vissza a kezdőoldalra
          </Link>
          <Link className={styles.secondaryAction} href="/#idovonal">
            Idővonal áttekintése
          </Link>
        </div>
      </section>
    </main>
  );
}
