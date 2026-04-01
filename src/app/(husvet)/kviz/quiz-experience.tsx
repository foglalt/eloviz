"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type {
  HusvetQuizContent,
  HusvetQuizQuestion,
  QuizOptionId,
} from "@/lib/husvet-quiz";
import { bajaAdventistChurch } from "../_content/baja-adventist-church";
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

type StoredQuizProgress = {
  answers: Record<string, QuizOptionId>;
  currentIndex: number;
  revealedHints: Record<string, boolean>;
};

const QUIZ_DEVICE_ID_STORAGE_KEY = "husvet-quiz-device-id-v1";
const QUIZ_PROGRESS_STORAGE_KEY = "husvet-quiz-progress-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStoredQuizProgress(
  rawValue: string | null,
  questions: HusvetQuizQuestion[],
): StoredQuizProgress | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsedValue)) {
      return null;
    }

    const validQuestionIds = new Set(questions.map((question) => question.id));
    const validOptionIdsByQuestion = new Map(
      questions.map((question) => [
        question.id,
        new Set(question.options.map((option) => option.id)),
      ]),
    );

    const normalizedAnswers = isRecord(parsedValue.answers)
      ? Object.fromEntries(
          Object.entries(parsedValue.answers).filter(([questionId, optionId]) => {
            const validOptionIds = validOptionIdsByQuestion.get(questionId);
            return (
              validOptionIds?.has(optionId as QuizOptionId) ?? false
            );
          }),
        ) as Record<string, QuizOptionId>
      : {};

    const normalizedHints = isRecord(parsedValue.revealedHints)
      ? Object.fromEntries(
          Object.entries(parsedValue.revealedHints).filter(([questionId, value]) => {
            return validQuestionIds.has(questionId) && value === true;
          }),
        ) as Record<string, boolean>
      : {};

    const currentIndex =
      typeof parsedValue.currentIndex === "number" &&
      Number.isFinite(parsedValue.currentIndex)
        ? Math.min(
            Math.max(Math.trunc(parsedValue.currentIndex), 0),
            questions.length,
          )
        : 0;

    return {
      answers: normalizedAnswers,
      currentIndex,
      revealedHints: normalizedHints,
    };
  } catch {
    return null;
  }
}

function createQuizDeviceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `device-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function getOrCreateStoredQuizDeviceId() {
  try {
    const storedDeviceId = window.localStorage.getItem(QUIZ_DEVICE_ID_STORAGE_KEY);

    if (storedDeviceId) {
      return storedDeviceId;
    }

    const nextDeviceId = createQuizDeviceId();
    window.localStorage.setItem(QUIZ_DEVICE_ID_STORAGE_KEY, nextDeviceId);
    return nextDeviceId;
  } catch {
    return null;
  }
}

function getCompletionMessage(totalQuestions: number) {
  if (totalQuestions === 1) {
    return "Köszönjük, hogy végigvitted ezt a kérdést. Ha szeretnéd személyesen is folytatni a beszélgetést, örömmel látunk Baján.";
  }

  return "Köszönjük, hogy végigjártad velünk a húsvéti történetet. Ha szeretnéd személyesen is továbbvinni a kérdéseidet, örömmel látunk a bajai adventista gyülekezetben.";
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
    return "1 eltérés, ennél mutatjuk a helyes választ és a magyarázatot";
  }

  return `${incorrectAnswers} eltérés, csak ezeknél mutatjuk a helyes választ és a magyarázatot`;
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
  const deviceIdRef = useRef<string | null>(null);
  const hasRestoredStoredProgress = useRef(false);

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

  useEffect(() => {
    let isCancelled = false;
    let storedProgress: StoredQuizProgress | null = null;

    try {
      storedProgress = getStoredQuizProgress(
        window.localStorage.getItem(QUIZ_PROGRESS_STORAGE_KEY),
        content.questions,
      );
    } catch {
      hasRestoredStoredProgress.current = true;
      return;
    }

    if (!storedProgress) {
      hasRestoredStoredProgress.current = true;
      return;
    }

    queueMicrotask(() => {
      if (isCancelled) {
        return;
      }

      hasRestoredStoredProgress.current = true;
      setAnswers(storedProgress.answers);
      setRevealedHints(storedProgress.revealedHints);
      setCurrentIndex(storedProgress.currentIndex);
    });

    return () => {
      isCancelled = true;
    };
  }, [content.questions]);

  useEffect(() => {
    if (!hasRestoredStoredProgress.current) {
      return;
    }

    try {
      window.localStorage.setItem(
        QUIZ_PROGRESS_STORAGE_KEY,
        JSON.stringify({
          answers,
          currentIndex,
          revealedHints,
        } satisfies StoredQuizProgress),
      );
    } catch {}
  }, [answers, currentIndex, revealedHints]);

  useEffect(() => {
    if (!hasRestoredStoredProgress.current) {
      return;
    }

    if (!deviceIdRef.current) {
      deviceIdRef.current = getOrCreateStoredQuizDeviceId();
    }

    const deviceId = deviceIdRef.current;

    if (!deviceId) {
      return;
    }

    const answeredCount = content.questions.reduce((count, question) => {
      return answers[question.id] ? count + 1 : count;
    }, 0);
    const correctAnswers = content.questions.reduce((count, question) => {
      return answers[question.id] === question.correctOptionId ? count + 1 : count;
    }, 0);
    const abortController = new AbortController();

    void fetch("/api/quiz-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answeredCount,
        correctAnswers,
        currentIndex,
        deviceId,
        isComplete,
        quizSlug: content.slug,
        totalQuestions,
      }),
      keepalive: true,
      signal: abortController.signal,
    }).catch(() => {});

    return () => {
      abortController.abort();
    };
  }, [answers, content.questions, content.slug, currentIndex, isComplete, totalQuestions]);

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

  function handleRestart() {
    try {
      window.localStorage.removeItem(QUIZ_PROGRESS_STORAGE_KEY);
    } catch {}

    setAnswers({});
    setRevealedHints({});
    setCurrentIndex(0);
    window.scrollTo({ top: 0, left: 0 });
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
              <h2>{bajaAdventistChurch.invitationTitle}</h2>
              <p className={styles.resultSummary}>
                {getCompletionMessage(totalQuestions)}
              </p>
              <p className={styles.inviteLead}>
                {bajaAdventistChurch.invitationCopy}
              </p>
            </div>
          </div>

          <div className={styles.inviteFacts}>
            <section className={styles.inviteFact}>
              <span className={styles.inviteFactLabel}>Kvíz eredmény</span>
              <strong>
                {correctAnswers} / {totalQuestions}
              </strong>
              <p>{getResultInsight(correctAnswers, totalQuestions)}</p>
            </section>

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
            <a
              className={styles.inviteSecondaryAction}
              href={bajaAdventistChurch.websiteHref}
              rel="noreferrer"
              target="_blank"
            >
              Gyülekezet oldala
            </a>
          </div>

          <button
            className={styles.restartAction}
            onClick={handleRestart}
            type="button"
          >
            Kvíz újrakezdése
          </button>

          <LearnMoreContactCta
            description="Ha szeretnéd, hogy felvegyük veled a kapcsolatot a húsvétról, egy bibliakörről vagy a bajai gyülekezetről, küldd el az elérhetőségedet."
            kicker={null}
            source="quiz"
            title="Ha szeretnél, szívesen keresünk"
          />

          <details className={styles.reviewPanel}>
            <summary className={styles.reviewSummary}>
              <span className={styles.reviewSummaryCopy}>
                <span className={styles.reviewSummaryTitle}>
                  Megnézem a válaszaimat
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
        </section>
      )}
    </main>
  );
}
