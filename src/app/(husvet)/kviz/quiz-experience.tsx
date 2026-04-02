"use client";

import type { HusvetQuizContent } from "@/lib/husvet-quiz";
import { QuizQuestionStage } from "./quiz-question-stage";
import { QuizResultPanel } from "./quiz-result-panel";
import styles from "./quiz-page.module.css";
import { useQuizSession } from "./use-quiz-session";

type QuizExperienceProps = {
  content: HusvetQuizContent;
};

export function QuizExperience({ content }: QuizExperienceProps) {
  const {
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
  } = useQuizSession(content);

  return (
    <main className={styles.page}>
      {!isComplete && currentQuestion ? (
        <QuizQuestionStage
          currentIndex={currentIndex}
          currentQuestion={currentQuestion}
          hintPanelId={hintPanelId}
          hintVisible={hintVisible}
          onAdvance={handleAdvance}
          onAnswerChange={handleAnswerChange}
          onBack={handleBack}
          onHintToggle={handleHintToggle}
          progressPercent={progressPercent}
          selectedAnswer={selectedAnswer}
          totalQuestions={totalQuestions}
        />
      ) : (
        <QuizResultPanel
          correctAnswers={correctAnswers}
          onRestart={handleRestart}
          reviewItems={reviewItems}
          totalQuestions={totalQuestions}
        />
      )}
    </main>
  );
}
