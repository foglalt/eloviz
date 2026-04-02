"use client";

import { useMemo, useState } from "react";
import { husvetQuizOptionIds, type HusvetQuizContent, type HusvetQuizQuestion, type QuizOptionId } from "@/lib/husvet-quiz";

function createEmptyQuestion(questionCount: number): HusvetQuizQuestion {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now()}-${questionCount}`;

  return {
    id: `uj-kerdes-${randomPart}`,
    prompt: "",
    reference: "",
    correctOptionId: "a",
    explanation: "",
    options: husvetQuizOptionIds.map((id) => ({
      id,
      text: "",
    })),
  };
}

export function useAdminQuizEditor(initialContent: HusvetQuizContent) {
  const [title, setTitle] = useState(initialContent.title);
  const [intro, setIntro] = useState(initialContent.intro);
  const [questions, setQuestions] = useState(initialContent.questions);

  function updateQuestion(
    questionId: string,
    patch: Partial<Pick<HusvetQuizQuestion, "prompt" | "reference" | "explanation" | "id">>,
  ) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId ? { ...question, ...patch } : question,
      ),
    );
  }

  function updateOption(questionId: string, optionId: QuizOptionId, text: string) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option) =>
            option.id === optionId ? { ...option, text } : option,
          ),
        };
      }),
    );
  }

  function setCorrectOption(questionId: string, optionId: QuizOptionId) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId ? { ...question, correctOptionId: optionId } : question,
      ),
    );
  }

  function addQuestion() {
    setQuestions((currentQuestions) => [
      ...currentQuestions,
      createEmptyQuestion(currentQuestions.length),
    ]);
  }

  function removeQuestion(questionId: string) {
    setQuestions((currentQuestions) => {
      if (currentQuestions.length === 1) {
        return currentQuestions;
      }

      return currentQuestions.filter((question) => question.id !== questionId);
    });
  }

  function moveQuestion(questionId: string, direction: "up" | "down") {
    setQuestions((currentQuestions) => {
      const currentIndex = currentQuestions.findIndex((question) => question.id === questionId);

      if (currentIndex === -1) {
        return currentQuestions;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= currentQuestions.length) {
        return currentQuestions;
      }

      const reorderedQuestions = [...currentQuestions];
      const [movedQuestion] = reorderedQuestions.splice(currentIndex, 1);
      reorderedQuestions.splice(targetIndex, 0, movedQuestion);
      return reorderedQuestions;
    });
  }

  const payload = useMemo(() => {
    return JSON.stringify({
      title,
      intro,
      questions,
    });
  }, [intro, questions, title]);

  return {
    addQuestion,
    intro,
    moveQuestion,
    payload,
    questions,
    removeQuestion,
    setCorrectOption,
    setIntro,
    setTitle,
    title,
    updateOption,
    updateQuestion,
  };
}
