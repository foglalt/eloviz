import Link from "next/link";
import { husvetSite } from "../_content/husvet-site";
import styles from "./husvet-landing-page.module.css";

export function HusvetLandingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{husvetSite.eyebrow}</p>
          <h1>{husvetSite.title}</h1>
          <p className={styles.lead}>{husvetSite.intro}</p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href={husvetSite.quiz.href}>
              {husvetSite.quiz.ctaLabel}
            </Link>
            <a className={styles.secondaryAction} href="#idovonal">
              {husvetSite.quiz.secondaryLabel}
            </a>
          </div>

          <p className={styles.note}>{husvetSite.note}</p>
        </div>

        <aside className={styles.spotlight}>
          <p className={styles.spotlightLabel}>Téma</p>
          <h2>{husvetSite.spotlight.title}</h2>
          <p className={styles.spotlightCopy}>
            {husvetSite.spotlight.description}
          </p>

          <ul className={styles.highlightList}>
            {husvetSite.spotlight.highlights.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className={styles.timelineSection} id="idovonal">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>vázlatos szerkezet</p>
          <h2>{husvetSite.timelineTitle}</h2>
          <p>{husvetSite.timelineIntro}</p>
        </div>

        <ol className={styles.timeline}>
          {husvetSite.timeline.map((event, index) => (
            <li className={styles.timelineItem} key={event.id}>
              <span className={styles.timelineMarker}>
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <article className={styles.timelineCard}>
                <div className={styles.timelineMeta}>
                  <span>{event.span}</span>
                  <span>{event.reference}</span>
                </div>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
