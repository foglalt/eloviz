import type { HusvetQuizQuestion, QuizOptionId } from "@/lib/husvet-quiz";
import styles from "./quiz-page.module.css";

type QuizQuestionStageProps = {
  currentIndex: number;
  currentQuestion: HusvetQuizQuestion;
  onAnswerChange: (questionId: string, optionId: QuizOptionId) => void;
  onAdvance: () => void;
  onBack: () => void;
  progressPercent: number;
  selectedAnswer?: QuizOptionId;
  totalQuestions: number;
};

export function QuizQuestionStage({
  currentIndex,
  currentQuestion,
  onAnswerChange,
  onAdvance,
  onBack,
  progressPercent,
  selectedAnswer,
  totalQuestions,
}: QuizQuestionStageProps) {
  return (
    <section className={styles.questionStage}>
      <div className={styles.stageSummary}>
        <div className={styles.stageMeta}>
          <span className={styles.stageLabel}>
            Kérdés {(currentIndex + 1).toString().padStart(2, "0")} /{" "}
            {totalQuestions.toString().padStart(2, "0")}
          </span>
        </div>

        <div className={styles.progressTrack} aria-hidden="true">
          <span className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <article className={styles.questionCard}>
        <h2>{currentQuestion.prompt}</h2>

        <div className={styles.hintPanel}>
          <strong>Kapcsolódó igehely</strong>
          <p>{currentQuestion.reference}</p>
          <p className={styles.hintEncouragement}>
            Keresd ki bátran, akár a kitett Bibliákban!
          </p>
        </div>

        <div className={styles.options}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.id;

            return (
              <label
                className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                key={option.id}
              >
                <input
                  checked={isSelected}
                  className={styles.optionInput}
                  name={currentQuestion.id}
                  onChange={() => onAnswerChange(currentQuestion.id, option.id)}
                  type="radio"
                  value={option.id}
                />
                <span className={styles.optionText}>{option.text}</span>
                <span aria-hidden="true" className={styles.optionIndicator} />
              </label>
            );
          })}
        </div>

        <div className={styles.navigationRow}>
          <button
            className={styles.previousAction}
            disabled={currentIndex === 0}
            onClick={onBack}
            type="button"
          >
            Előző
          </button>
          <button
            className={styles.primaryAction}
            disabled={!selectedAnswer}
            onClick={onAdvance}
            type="button"
          >
            {currentIndex === totalQuestions - 1 ? "Befejezés" : "Tovább a következőre"}
          </button>
        </div>
      </article>
    </section>
  );
}
