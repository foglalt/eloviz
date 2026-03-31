"use client";

import Link from "next/link";
import { useState } from "react";
import type { HusvetQuizContent, QuizOptionId } from "@/lib/husvet-quiz";
import { husvetSite } from "../_content/husvet-site";
import styles from "./quiz-page.module.css";

type QuizExperienceProps = {
  content: HusvetQuizContent;
};

function getCompletionMessage(totalQuestions: number) {
  if (totalQuestions === 1) {
    return "A válaszod rögzült. A helyességet most nem jelezzük vissza, hogy a kérdés inkább személyes átgondolásra hívjon.";
  }

  return "Végigértél az összes kérdésen. A helyességet most nem jelezzük vissza, így az igehely-súgókkal és a történet ívével nyugodtabban lehet tovább gondolni a témát.";
}

export function QuizExperience({ content }: QuizExperienceProps) {
  const [answers, setAnswers] = useState<Record<string, QuizOptionId>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>(
    {},
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = content.questions.length;
  const isComplete = currentIndex >= totalQuestions;
  const currentQuestion = isComplete ? null : content.questions[currentIndex];
  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const hintVisible = currentQuestion
    ? Boolean(revealedHints[currentQuestion.id])
    : false;
  const hintPanelId = currentQuestion ? `igehely-${currentQuestion.id}` : undefined;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  function handleAnswerChange(questionId: string, optionId: QuizOptionId) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionId,
    }));
  }

  function handleAdvance() {
    if (!currentQuestion || !selectedAnswer) {
      return;
    }

    setCurrentIndex((currentStep) => Math.min(currentStep + 1, totalQuestions));
  }

  function handleBack() {
    setCurrentIndex((currentStep) => Math.max(currentStep - 1, 0));
  }

  function handleHintToggle() {
    if (!currentQuestion) {
      return;
    }

    setRevealedHints((currentHints) => ({
      ...currentHints,
      [currentQuestion.id]: !currentHints[currentQuestion.id],
    }));
  }

  function handleReset() {
    setAnswers({});
    setRevealedHints({});
    setCurrentIndex(0);
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{husvetSite.domain} / kvíz</p>
          <h1>{content.title}</h1>
          <p className={styles.lead}>{content.intro}</p>
        </div>

        <aside className={styles.progressPanel}>
          <p className={styles.progressLabel}>Állapot</p>
          <strong>
            {answeredCount}/{totalQuestions}
          </strong>
          <div className={styles.progressTrack} aria-hidden="true">
            <span
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p>
            {isComplete
              ? "Végigértél a kérdéseken. A válaszok helyességét most nem mutatjuk meg."
              : "Egyszerre egy kérdés látszik. Válassz, majd lépj tovább a következőre."}
          </p>
        </aside>
      </section>

      {!isComplete && currentQuestion ? (
        <section className={styles.questionStage}>
          <article className={styles.questionCard}>
            <div className={styles.questionMeta}>
              <span>{(currentIndex + 1).toString().padStart(2, "0")}</span>
              <span>
                {currentIndex === totalQuestions - 1
                  ? "Utolsó kérdés"
                  : "Következő állomás"}
              </span>
            </div>

            <h2>{currentQuestion.prompt}</h2>
            <p className={styles.questionStatus}>
              Jelöld meg a szerinted helyes választ. A helyességet most nem
              jelezzük vissza azonnal.
            </p>

            <div className={styles.hintRow}>
              <button
                aria-controls={hintPanelId}
                aria-expanded={hintVisible}
                className={styles.hintButton}
                onClick={handleHintToggle}
                type="button"
              >
                {hintVisible ? "Igehely elrejtése" : "Igehely megmutatása"}
              </button>
              <span className={styles.hintNote}>
                A súgó csak a kapcsolódó bibliai helyet mutatja meg.
              </span>
            </div>

            {hintVisible ? (
              <div className={styles.hintPanel} id={hintPanelId}>
                <strong>Kapcsolódó igehely</strong>
                <p>{currentQuestion.reference}</p>
              </div>
            ) : null}

            <div className={styles.options}>
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;

                return (
                  <label
                    className={`${styles.option} ${
                      isSelected ? styles.optionSelected : ""
                    }`}
                    key={option.id}
                  >
                    <input
                      checked={isSelected}
                      name={currentQuestion.id}
                      onChange={() =>
                        handleAnswerChange(currentQuestion.id, option.id)
                      }
                      type="radio"
                      value={option.id}
                    />
                    <span className={styles.optionKey}>
                      {option.id.toUpperCase()}
                    </span>
                    <span>{option.text}</span>
                  </label>
                );
              })}
            </div>

            <div className={styles.navigationRow}>
              <button
                className={styles.secondaryAction}
                disabled={currentIndex === 0}
                onClick={handleBack}
                type="button"
              >
                Előző kérdés
              </button>
              <button
                className={styles.primaryAction}
                disabled={!selectedAnswer}
                onClick={handleAdvance}
                type="button"
              >
                {currentIndex === totalQuestions - 1
                  ? "Befejezés"
                  : "Tovább a következőre"}
              </button>
            </div>
          </article>

          <div className={styles.actions}>
            <button
              className={styles.tertiaryAction}
              onClick={handleReset}
              type="button"
            >
              Újrakezdés
            </button>
            <Link className={styles.tertiaryAction} href="/">
              Vissza a kezdőoldalra
            </Link>
          </div>
        </section>
      ) : (
        <section className={styles.resultPanel}>
          <p className={styles.resultLabel}>Kész</p>
          <h2>Végigértél a kérdéseken</h2>
          <p>{getCompletionMessage(totalQuestions)}</p>
          <div className={styles.actions}>
            <button
              className={styles.primaryAction}
              onClick={handleReset}
              type="button"
            >
              Újrakezdés
            </button>
            <Link className={styles.tertiaryAction} href="/">
              Vissza a kezdőoldalra
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
