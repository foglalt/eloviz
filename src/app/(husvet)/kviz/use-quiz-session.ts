"use client";

import { useEffect, useRef, useState } from "react";
import type {
  HusvetQuizContent,
  HusvetQuizQuestion,
  QuizOptionId,
} from "@/lib/husvet-quiz";
import { isRecord } from "@/lib/value-utils";

type StoredQuizProgress = {
  answers: Record<string, QuizOptionId>;
  currentIndex: number;
  revealedHints: Record<string, boolean>;
};

export type QuizReviewItem = {
  question: HusvetQuizQuestion;
  selectedOptionText: string;
  correctOptionText: string;
  isCorrect: boolean;
};

const QUIZ_DEVICE_ID_STORAGE_KEY = "husvet-quiz-device-id-v1";
const QUIZ_PROGRESS_STORAGE_KEY = "husvet-quiz-progress-v1";

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
            return validOptionIds?.has(optionId as QuizOptionId) ?? false;
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

    const answeredInOrder = questions.findIndex((question) => {
      return !normalizedAnswers[question.id];
    });
    const firstUnansweredIndex =
      answeredInOrder === -1 ? questions.length : answeredInOrder;
    const restoredIndex =
      typeof parsedValue.currentIndex === "number" &&
      Number.isFinite(parsedValue.currentIndex)
        ? Math.max(Math.trunc(parsedValue.currentIndex), 0)
        : 0;
    const currentIndex = Math.min(restoredIndex, firstUnansweredIndex);

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

function getOptionText(
  question: HusvetQuizQuestion,
  optionId: QuizOptionId | undefined,
) {
  return (
    question.options.find((option) => option.id === optionId)?.text ??
    "Nem választottál választ"
  );
}

export function useQuizSession(content: HusvetQuizContent) {
  const [answers, setAnswers] = useState<Record<string, QuizOptionId>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const deviceIdRef = useRef<string | null>(null);
  const hasRestoredStoredProgress = useRef(false);

  const totalQuestions = content.questions.length;
  const isComplete = currentIndex >= totalQuestions;
  const currentQuestion = isComplete ? null : content.questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
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
    const matchedCorrectAnswers = content.questions.reduce((count, question) => {
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
        correctAnswers: matchedCorrectAnswers,
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

  useEffect(() => {
    document.body.dataset.husvetQuizComplete = isComplete ? "true" : "false";

    return () => {
      delete document.body.dataset.husvetQuizComplete;
    };
  }, [isComplete]);

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

  return {
    correctAnswers,
    currentIndex,
    currentQuestion,
    handleAdvance,
    handleAnswerChange,
    handleBack,
    handleHintToggle,
    handleRestart,
    hintPanelId,
    hintVisible,
    isComplete,
    progressPercent,
    reviewItems,
    selectedAnswer,
    totalQuestions,
  };
}
