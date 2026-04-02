import type { HusvetQuizQuestion, QuizOptionId } from "@/lib/husvet-quiz";
import styles from "./admin.module.css";

type AdminQuizQuestionCardProps = {
  index: number;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  onSetCorrectOption: (optionId: QuizOptionId) => void;
  onUpdateOption: (optionId: QuizOptionId, text: string) => void;
  onUpdateQuestion: (
    patch: Partial<Pick<HusvetQuizQuestion, "prompt" | "reference" | "explanation" | "id">>,
  ) => void;
  question: HusvetQuizQuestion;
};

export function AdminQuizQuestionCard({
  index,
  onMoveDown,
  onMoveUp,
  onRemove,
  onSetCorrectOption,
  onUpdateOption,
  onUpdateQuestion,
  question,
}: AdminQuizQuestionCardProps) {
  return (
    <article className={styles.questionCard}>
      <div className={styles.questionToolbar}>
        <div>
          <p className={styles.questionIndex}>{(index + 1).toString().padStart(2, "0")}</p>
          <h3>{question.prompt || "Új kérdés"}</h3>
        </div>

        <div className={styles.questionActions}>
          <button onClick={onMoveUp} type="button">
            Feljebb
          </button>
          <button onClick={onMoveDown} type="button">
            Lejjebb
          </button>
          <button onClick={onRemove} type="button">
            Törlés
          </button>
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>Kérdésszöveg</span>
          <textarea
            onChange={(event) =>
              onUpdateQuestion({
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
              onUpdateQuestion({
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
              onUpdateQuestion({
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
            <span>{String.fromCharCode(65 + optionIndex)} válasz</span>
            <input onChange={(event) => onUpdateOption(option.id, event.target.value)} value={option.text} />

            <span className={styles.radioRow}>
              <input
                checked={question.correctOptionId === option.id}
                name={`correct-${question.id}`}
                onChange={() => onSetCorrectOption(option.id)}
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
            onUpdateQuestion({
              explanation: event.target.value,
            })
          }
          rows={4}
          value={question.explanation}
        />
      </label>
    </article>
  );
}
