"use client";

import { useState } from "react";
import type { HusvetQuizContent, QuizOptionId } from "@/lib/husvet-quiz";
import { LearnMoreContactCta } from "../_components/learn-more-contact-cta";
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
    totalQuestions > 0
      ? Math.round(
          ((isComplete ? totalQuestions : currentIndex + 1) / totalQuestions) * 100,
        )
      : 0;

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

  return (
    <main className={styles.page}>
      {!isComplete && currentQuestion ? (
        <section className={styles.questionStage}>
          <div className={styles.stageSummary}>
            <div className={styles.stageMeta}>
              <span className={styles.stageLabel}>
                Kérdés {(currentIndex + 1).toString().padStart(2, "0")} /{" "}
                {totalQuestions.toString().padStart(2, "0")}
              </span>
              <button
                aria-controls={hintPanelId}
                aria-expanded={hintVisible}
                className={styles.hintButton}
                onClick={handleHintToggle}
                type="button"
              >
                {hintVisible ? "Igehely elrejtése" : "Igehely megmutatása"}
              </button>
            </div>

            <div className={styles.progressTrack} aria-hidden="true">
              <span
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <article className={styles.questionCard}>
            <h2>{currentQuestion.prompt}</h2>

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
                      className={styles.optionInput}
                      name={currentQuestion.id}
                      onChange={() =>
                        handleAnswerChange(currentQuestion.id, option.id)
                      }
                      type="radio"
                      value={option.id}
                    />
                    <span className={styles.optionText}>{option.text}</span>
                    <span
                      aria-hidden="true"
                      className={styles.optionIndicator}
                    />
                  </label>
                );
              })}
            </div>

            <div className={styles.navigationRow}>
              <button
                className={styles.previousAction}
                disabled={currentIndex === 0}
                onClick={handleBack}
                type="button"
              >
                Előző
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
        </section>
      ) : (
        <section className={styles.resultPanel}>
          <p className={styles.resultLabel}>Kész</p>
          <h2>Végigértél a kérdéseken</h2>
          <p className={styles.resultSummary}>
            {getCompletionMessage(totalQuestions)}
          </p>
          <LearnMoreContactCta
            description="Ha szeretnél személyesebb segítséget, további húsvéti anyagokat vagy egy későbbi beszélgetést, küldd el az elérhetőségedet."
            source="quiz"
            title="Menj tovább egy következő lépéssel"
          />
        </section>
      )}
    </main>
  );
}
