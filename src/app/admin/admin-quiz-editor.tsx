"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { formatHuTimestamp } from "@/lib/date-utils";
import type { HusvetQuizContent } from "@/lib/husvet-quiz";
import { saveQuizContentAction } from "./actions";
import { idleAdminActionState, type AdminActionState } from "./action-state";
import { AdminQuizQuestionCard } from "./admin-quiz-question-card";
import styles from "./admin.module.css";
import { useAdminQuizEditor } from "./use-admin-quiz-editor";

type AdminQuizEditorProps = {
  initialContent: HusvetQuizContent;
  storageStatus: {
    configured: boolean;
    label: string;
    note: string;
  };
};

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className={styles.primaryButton} disabled={disabled || pending} type="submit">
      {pending ? "Mentés folyamatban..." : "Módosítások mentése"}
    </button>
  );
}

export function AdminQuizEditor({ initialContent, storageStatus }: AdminQuizEditorProps) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    saveQuizContentAction,
    idleAdminActionState,
  );
  const {
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
  } = useAdminQuizEditor(initialContent);

  const lastSavedAt = state.savedAt ?? initialContent.updatedAt;

  return (
    <form action={formAction} className={styles.editorForm}>
      <div className={styles.workspaceHeader}>
        <div>
          <p className={styles.kicker}>Szerkesztés</p>
          <h1>Húsvéti kérdéssor</h1>
          <p className={styles.workspaceIntro}>
            A mentés után a közönségnek szánt <a href="/kviz">/kviz</a> oldal az új adatokat
            használja.
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
            <strong>{formatHuTimestamp(lastSavedAt, "Még nem volt adatbázis-mentés.")}</strong>
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
            <input onChange={(event) => setTitle(event.target.value)} value={title} />
          </label>

          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span>Bevezető</span>
            <textarea onChange={(event) => setIntro(event.target.value)} rows={4} value={intro} />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>Kérdések</h2>
          <p>
            Minden kérdéshez négy válaszlehetőség tartozik. A helyes opciót külön jelöld.
          </p>
        </div>

        <div className={styles.questionList}>
          {questions.map((question, index) => (
            <AdminQuizQuestionCard
              index={index}
              key={question.id}
              onMoveDown={() => moveQuestion(question.id, "down")}
              onMoveUp={() => moveQuestion(question.id, "up")}
              onRemove={() => removeQuestion(question.id)}
              onSetCorrectOption={(optionId) => setCorrectOption(question.id, optionId)}
              onUpdateOption={(optionId, text) => updateOption(question.id, optionId, text)}
              onUpdateQuestion={(patch) => updateQuestion(question.id, patch)}
              question={question}
            />
          ))}
        </div>

        <button className={styles.secondaryButton} onClick={addQuestion} type="button">
          Új kérdés hozzáadása
        </button>
      </section>

      {state.message ? (
        <p
          className={state.status === "error" ? styles.errorMessage : styles.successMessage}
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
