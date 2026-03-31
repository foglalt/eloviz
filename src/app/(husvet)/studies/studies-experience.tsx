"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  StudiesPageContent,
  StudyTopic,
} from "../_content/studies-content";
import styles from "./studies-page.module.css";

type StudiesExperienceProps = {
  content: StudiesPageContent;
};

function getInitialOpenTopics(topics: StudyTopic[]) {
  const firstTopic = topics[0];

  if (!firstTopic) {
    return {};
  }

  return {
    [firstTopic.id]: true,
  } satisfies Record<string, boolean>;
}

export function StudiesExperience({ content }: StudiesExperienceProps) {
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>(
    getInitialOpenTopics(content.topics),
  );

  const allOpen = content.topics.every((topic) => openTopics[topic.id]);

  function toggleTopic(topicId: string) {
    setOpenTopics((currentTopics) => ({
      ...currentTopics,
      [topicId]: !currentTopics[topicId],
    }));
  }

  function setEveryTopic(nextValue: boolean) {
    setOpenTopics(
      Object.fromEntries(content.topics.map((topic) => [topic.id, nextValue])),
    );
  }

  function handlePrint() {
    window.print();
  }

  function renderTopicBody(topic: StudyTopic) {
    return (
      <>
        <p className={styles.reference}>{topic.reference}</p>
        <p className={styles.summary}>{topic.summary}</p>

        <div className={styles.sectionList}>
          {topic.sections.map((section) => (
            <section className={styles.detailSection} key={section.title}>
              <h3>{section.title}</h3>

              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              {section.bullets ? (
                <ul className={styles.bulletList}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.screenShell}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p className={styles.lead}>{content.intro}</p>
          </div>

          <aside className={styles.actionsPanel}>
            <div className={styles.actionsGroup}>
              <button
                className={styles.primaryAction}
                onClick={handlePrint}
                type="button"
              >
                Exportálás PDF-be
              </button>
              <button
                className={styles.secondaryAction}
                onClick={() => setEveryTopic(true)}
                type="button"
              >
                Összes megnyitása
              </button>
              <button
                className={styles.secondaryAction}
                disabled={!allOpen}
                onClick={() => setEveryTopic(false)}
                type="button"
              >
                Összes bezárása
              </button>
            </div>

            <p className={styles.exportNote}>{content.exportNote}</p>

            <div className={styles.linkRow}>
              <Link className={styles.tertiaryAction} href="/">
                Vissza a kezdőoldalra
              </Link>
              <Link className={styles.tertiaryAction} href="/kviz">
                Ugrás a kvízhez
              </Link>
            </div>
          </aside>
        </section>

        <section className={styles.topicSection}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Témalisták</p>
            <h2>Megnyitható tanulmányi blokkok</h2>
            <p>
              Egy-egy témát külön is kinyithatsz, ha csak rövid áttekintést
              szeretnél, vagy az exporttal együtt is elviheted az összes anyagot.
            </p>
          </div>

          <div className={styles.topicList}>
            {content.topics.map((topic, index) => {
              const isOpen = Boolean(openTopics[topic.id]);
              const panelId = `${topic.id}-content`;

              return (
                <article className={styles.topicCard} key={topic.id}>
                  <div className={styles.topicHeader}>
                    <div>
                      <p className={styles.topicIndex}>
                        {(index + 1).toString().padStart(2, "0")}
                      </p>
                      <h3>{topic.title}</h3>
                    </div>

                    <button
                      aria-controls={panelId}
                      aria-expanded={isOpen}
                      className={styles.toggleButton}
                      onClick={() => toggleTopic(topic.id)}
                      type="button"
                    >
                      {isOpen ? "Bezárás" : "Megnyitás"}
                    </button>
                  </div>

                  {isOpen ? (
                    <div className={styles.topicBody} id={panelId}>
                      {renderTopicBody(topic)}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <div aria-hidden="true" className={styles.printSheet}>
        <header className={styles.printHeader}>
          <p>{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
        </header>

        <div className={styles.printTopicList}>
          {content.topics.map((topic) => (
            <article className={styles.printTopic} key={topic.id}>
              <h2>{topic.title}</h2>
              {renderTopicBody(topic)}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
