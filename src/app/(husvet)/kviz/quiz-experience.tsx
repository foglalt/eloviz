"use client";

import { useState } from "react";
import type {
  HusvetQuizContent,
  HusvetQuizQuestion,
  QuizOptionId,
} from "@/lib/husvet-quiz";
import { LearnMoreContactCta } from "../_components/learn-more-contact-cta";
import styles from "./quiz-page.module.css";

type QuizExperienceProps = {
  content: HusvetQuizContent;
};

type QuizReviewItem = {
  question: HusvetQuizQuestion;
  selectedOptionText: string;
  correctOptionText: string;
  isCorrect: boolean;
};

function getCompletionMessage(totalQuestions: number) {
  if (totalQuestions === 1) {
    return "A válaszod rögzült. Lent látod a rövid eredményt, és megnyithatod a részletes áttekintést is.";
  }

  return "Végigértél az összes kérdésen. Lent egy rövid összesítést látsz, és megnyithatod a válaszaid részletes áttekintését is.";
}

function getResultInsight(correctAnswers: number, totalQuestions: number) {
  const incorrectAnswers = Math.max(totalQuestions - correctAnswers, 0);

  if (totalQuestions === 0) {
    return "Még nincs értékelhető kérdés.";
  }

  if (incorrectAnswers === 0) {
    return "Minden kérdésnél jó választ jelöltél.";
  }

  if (incorrectAnswers === 1) {
    return "Egy kérdésnél más választ jelöltél.";
  }

  return `${incorrectAnswers} kérdésnél más választ jelöltél.`;
}

function getReviewSummaryMeta(correctAnswers: number, totalQuestions: number) {
  const incorrectAnswers = Math.max(totalQuestions - correctAnswers, 0);

  if (incorrectAnswers === 0) {
    return "Minden válaszod helyes lett";
  }

  if (incorrectAnswers === 1) {
    return "1 kérdésnél volt eltérés";
  }

  return `${incorrectAnswers} kérdésnél volt eltérés`;
}

function getOptionText(
  question: HusvetQuizQuestion,
  optionId: QuizOptionId | undefined,
) {
  return (
    question.options.find((option) => option.id === optionId)?.text ??
    "Nem választottál választ"
  );
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

  const reviewItems: QuizReviewItem[] = content.questions.map((question) => {
    const selectedOptionId = answers[question.id];
    const isCorrect = selectedOptionId === question.correctOptionId;

    return {
      question,
      selectedOptionText: getOptionText(question, selectedOptionId),
      correctOptionText: getOptionText(question, question.correctOptionId),
      isCorrect,
    };
  });

  const correctAnswers = reviewItems.filter((item) => item.isCorrect).length;

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
          <p className={styles.resultLabel}>Eredmény</p>
          <h2>Végigértél a kérdéseken</h2>
          <p className={styles.resultSummary}>
            {getCompletionMessage(totalQuestions)}
          </p>

          <div className={styles.resultScoreCard}>
            <p className={styles.resultScoreValue}>
              <strong>{correctAnswers}</strong>
              <span>/ {totalQuestions}</span>
            </p>

            <div className={styles.resultScoreCopy}>
              <p className={styles.resultScoreLabel}>Helyes válasz</p>
              <p>{getResultInsight(correctAnswers, totalQuestions)}</p>
            </div>
          </div>

          <details className={styles.reviewPanel}>
            <summary className={styles.reviewSummary}>
              <span className={styles.reviewSummaryCopy}>
                <span className={styles.reviewSummaryTitle}>
                  Válaszaid részletesen
                </span>
                <span className={styles.reviewSummaryMeta}>
                  {getReviewSummaryMeta(correctAnswers, totalQuestions)}
                </span>
              </span>
            </summary>

            <div className={styles.reviewList}>
              {reviewItems.map((item, index) => (
                <article
                  className={`${styles.reviewItem} ${
                    item.isCorrect
                      ? styles.reviewItemCorrect
                      : styles.reviewItemIncorrect
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

                  {!item.isCorrect ? (
                    <>
                      <div className={styles.reviewAnswerBlock}>
                        <span className={styles.reviewAnswerLabel}>
                          Helyes válasz
                        </span>
                        <p>{item.correctOptionText}</p>
                      </div>
                      <p className={styles.reviewExplanation}>
                        {item.question.explanation}
                      </p>
                    </>
                  ) : null}
                </article>
              ))}
            </div>
          </details>

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
