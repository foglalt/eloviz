import Image from "next/image";
import { bajaAdventistChurch } from "../_content/baja-adventist-church";
import { LearnMoreContactCta } from "../_components/learn-more-contact-cta";
import type { QuizReviewItem } from "./use-quiz-session";
import styles from "./quiz-page.module.css";

type QuizResultPanelProps = {
  correctAnswers: number;
  onRestart: () => void;
  reviewItems: QuizReviewItem[];
  totalQuestions: number;
};

function getReviewSummaryMeta(correctAnswers: number, totalQuestions: number) {
  const incorrectAnswers = Math.max(totalQuestions - correctAnswers, 0);

  if (incorrectAnswers === 0) {
    return "Minden válaszod helyes lett";
  }

  if (incorrectAnswers === 1) {
    return "1 eltérés, ennél mutatjuk a helyes választ és a magyarázatot";
  }

  return `${incorrectAnswers} eltérés, csak ezeknél mutatjuk a helyes választ és a magyarázatot`;
}

export function QuizResultPanel({
  correctAnswers,
  onRestart,
  reviewItems,
  totalQuestions,
}: QuizResultPanelProps) {
  return (
    <section className={styles.resultPanel}>
      <div className={styles.inviteHero}>
        <span className={styles.inviteLogoFrame}>
          <Image
            alt=""
            aria-hidden="true"
            className={styles.inviteLogo}
            height={96}
            priority
            src="/adventist-hu-centered--black.svg"
            width={96}
          />
        </span>

        <div className={styles.inviteCopy}>
          <p className={styles.inviteChurch}>
            {bajaAdventistChurch.city} • {bajaAdventistChurch.churchName}
          </p>
          <h2>{bajaAdventistChurch.completionTitle}</h2>
          <p className={styles.resultSummary}>
            {"Köszönjük, hogy végigjártad velünk a húsvéti történetet, reméljük hasznos volt számodra!"}
          </p>
          <p className={styles.inviteLead}>{bajaAdventistChurch.completionCopy}</p>
        </div>
      </div>

      <div className={styles.inviteFacts}>
        <section className={styles.inviteFact}>
          <span className={styles.inviteFactLabel}>Cím</span>
          <strong>{bajaAdventistChurch.address}</strong>
        </section>

        <section className={styles.inviteFact}>
          <span className={styles.inviteFactLabel}>Szombati alkalmak</span>
          <div className={styles.inviteSchedule}>
            {bajaAdventistChurch.serviceTimes.map((service) => (
              <p key={service.label}>
                <span>{service.label}</span>
                <strong>{service.value}</strong>
              </p>
            ))}
          </div>
        </section>
      </div>

      <div className={styles.inviteActions}>
        <a
          className={styles.invitePrimaryAction}
          href={bajaAdventistChurch.directionsHref}
          rel="noreferrer"
          target="_blank"
        >
          Útvonal megnyitása
        </a>
      </div>

      <button className={styles.restartAction} onClick={onRestart} type="button">
        Kvíz újrakezdése
      </button>

      <LearnMoreContactCta
        description="Mindig is tudtad, hogy az élet több, mint amit látsz? Szeretnél többet megtudni Istenről, a Bibliáról, vagy arról, hogyan tapasztalhatod meg Isten szeretetét a saját életedben?"
        kicker={null}
        source="quiz"
        title="Szeretnél többet megtudni Istenről?"
      />

      <details className={styles.reviewPanel}>
        <summary className={styles.reviewSummary}>
          <span className={styles.reviewSummaryCopy}>
            <span className={styles.reviewSummaryTitle}>Megnézem a válaszaimat</span>
            <span className={styles.reviewSummaryMeta}>
              {getReviewSummaryMeta(correctAnswers, totalQuestions)}
            </span>
          </span>
        </summary>

        <div className={styles.reviewList}>
          {reviewItems.map((item, index) => (
            <article
              className={`${styles.reviewItem} ${
                item.isCorrect ? styles.reviewItemCorrect : styles.reviewItemIncorrect
              }`}
              key={item.question.id}
            >
              <div className={styles.reviewItemHeader}>
                <span className={styles.reviewItemStep}>
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span className={styles.reviewItemStatus}>
                  {item.isCorrect ? "Helyes válasz" : "Eltérő válasz"}
                </span>
              </div>

              <h3>{item.question.prompt}</h3>

              <div className={styles.reviewAnswerBlock}>
                <span className={styles.reviewAnswerLabel}>A válaszod</span>
                <p>{item.selectedOptionText}</p>
              </div>

              <div className={styles.reviewAnswerBlock}>
                <span className={styles.reviewAnswerLabel}>Kapcsolódó igehely</span>
                <p className={styles.reviewReference}>{item.question.reference}</p>
              </div>

              {!item.isCorrect ? (
                <>
                  <div className={styles.reviewAnswerBlock}>
                    <span className={styles.reviewAnswerLabel}>Helyes válasz</span>
                    <p>{item.correctOptionText}</p>
                  </div>
                  <p className={styles.reviewExplanation}>{item.question.explanation}</p>
                </>
              ) : null}
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
