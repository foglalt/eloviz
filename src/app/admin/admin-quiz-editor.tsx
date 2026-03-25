"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  husvetQuizOptionIds,
  type HusvetQuizContent,
  type HusvetQuizQuestion,
  type QuizOptionId,
} from "@/lib/husvet-quiz";
import { saveQuizContentAction } from "./actions";
import {
  idleAdminActionState,
  type AdminActionState,
} from "./action-state";
import styles from "./admin.module.css";

type AdminQuizEditorProps = {
  initialContent: HusvetQuizContent;
  storageStatus: {
    configured: boolean;
    label: string;
    note: string;
  };
};

function formatTimestamp(value?: string | null) {
  if (!value) {
    return "Még nem volt adatbázis-mentés.";
  }

  return new Intl.DateTimeFormat("hu-HU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className={styles.primaryButton} disabled={disabled || pending} type="submit">
      {pending ? "Mentés folyamatban..." : "Módosítások mentése"}
    </button>
  );
}

export function AdminQuizEditor({
  initialContent,
  storageStatus,
}: AdminQuizEditorProps) {
  const [title, setTitle] = useState(initialContent.title);
  const [intro, setIntro] = useState(initialContent.intro);
  const [questions, setQuestions] = useState(initialContent.questions);
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    saveQuizContentAction,
    idleAdminActionState,
  );

  const lastSavedAt = state.savedAt ?? initialContent.updatedAt;

  function updateQuestion(
    questionId: string,
    patch: Partial<
      Pick<HusvetQuizQuestion, "prompt" | "reference" | "explanation" | "id">
    >,
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
        question.id === questionId
          ? { ...question, correctOptionId: optionId }
          : question,
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
      const currentIndex = currentQuestions.findIndex(
        (question) => question.id === questionId,
      );

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

  const payload = JSON.stringify({
    title,
    intro,
    questions,
  });

  return (
    <form action={formAction} className={styles.editorForm}>
      <div className={styles.workspaceHeader}>
        <div>
          <p className={styles.kicker}>Szerkesztés</p>
          <h1>Húsvéti kérdéssor</h1>
          <p className={styles.workspaceIntro}>
            A mentés után a közönségnek szánt <a href="/kviz">/kviz</a> oldal az új
            adatokat használja.
          </p>
        </div>

        <div className={styles.statusStack}>
          <div className={styles.statusBadge}>
            <span>Tárolás</span>
            <strong>{storageStatus.label}</strong>
          </div>
          <div className={styles.statusBadge}>
            <span>Kérdések</span>
            <strong>{questions.length}</strong>
          </div>
          <div className={styles.statusBadge}>
            <span>Utolsó mentés</span>
            <strong>{formatTimestamp(lastSavedAt)}</strong>
          </div>
        </div>
      </div>

      <p className={styles.storageNote}>{storageStatus.note}</p>

      <input name="payload" type="hidden" value={payload} />

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>Bevezető</h2>
          <p>A nyitó szöveg jelenik meg a kvíz tetején.</p>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Cím</span>
            <input
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </label>

          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>Bevezető</span>
            <textarea
              onChange={(event) => setIntro(event.target.value)}
              rows={4}
              value={intro}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>Kérdések</h2>
          <p>
            Minden kérdéshez négy válaszlehetőség tartozik. A helyes opciót külön
            jelöld.
          </p>
        </div>

        <div className={styles.questionList}>
          {questions.map((question, index) => (
            <article className={styles.questionCard} key={question.id}>
              <div className={styles.questionToolbar}>
                <div>
                  <p className={styles.questionIndex}>
                    {(index + 1).toString().padStart(2, "0")}
                  </p>
                  <h3>{question.prompt || "Új kérdés"}</h3>
                </div>

                <div className={styles.questionActions}>
                  <button
                    onClick={() => moveQuestion(question.id, "up")}
                    type="button"
                  >
                    Feljebb
                  </button>
                  <button
                    onClick={() => moveQuestion(question.id, "down")}
                    type="button"
                  >
                    Lejjebb
                  </button>
                  <button
                    onClick={() => removeQuestion(question.id)}
                    type="button"
                  >
                    Törlés
                  </button>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <label className={`${styles.field} ${styles.fieldWide}`}>
                  <span>Kérdésszöveg</span>
                  <textarea
                    onChange={(event) =>
                      updateQuestion(question.id, {
                        prompt: event.target.value,
                      })
                    }
                    rows={3}
                    value={question.prompt}
                  />
                </label>

                <label className={styles.field}>
                  <span>Azonosító</span>
                  <input
                    onChange={(event) =>
                      updateQuestion(question.id, {
                        id: event.target.value,
                      })
                    }
                    value={question.id}
                  />
                </label>

                <label className={styles.field}>
                  <span>Igehely</span>
                  <input
                    onChange={(event) =>
                      updateQuestion(question.id, {
                        reference: event.target.value,
                      })
                    }
                    value={question.reference}
                  />
                </label>
              </div>

              <div className={styles.answerGrid}>
                {question.options.map((option, optionIndex) => (
                  <label className={styles.answerField} key={option.id}>
                    <span>
                      {String.fromCharCode(65 + optionIndex)} válasz
                    </span>
                    <input
                      onChange={(event) =>
                        updateOption(question.id, option.id, event.target.value)
                      }
                      value={option.text}
                    />

                    <span className={styles.radioRow}>
                      <input
                        checked={question.correctOptionId === option.id}
                        name={`correct-${question.id}`}
                        onChange={() => setCorrectOption(question.id, option.id)}
                        type="radio"
                      />
                      Helyes válasz
                    </span>
                  </label>
                ))}
              </div>

              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>Magyarázat</span>
                <textarea
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      explanation: event.target.value,
                    })
                  }
                  rows={4}
                  value={question.explanation}
                />
              </label>
            </article>
          ))}
        </div>

        <button className={styles.secondaryButton} onClick={addQuestion} type="button">
          Új kérdés hozzáadása
        </button>
      </section>

      {state.message ? (
        <p
          className={
            state.status === "error" ? styles.errorMessage : styles.successMessage
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <div className={styles.footerActions}>
        <SaveButton disabled={!storageStatus.configured} />
        <a className={styles.ghostLink} href="/kviz" rel="noreferrer" target="_blank">
          Kvíz megnyitása új lapon
        </a>
      </div>
    </form>
  );
}
