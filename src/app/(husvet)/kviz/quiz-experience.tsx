"use client";

import Link from "next/link";
import { useState } from "react";
import type { HusvetQuizContent, QuizOptionId } from "@/lib/husvet-quiz";
import { husvetSite } from "../_content/husvet-site";
import styles from "./quiz-page.module.css";

type QuizExperienceProps = {
  content: HusvetQuizContent;
};

function getResultSummary(score: number, total: number) {
  const ratio = score / total;

  if (ratio === 1) {
    return "Szép munka: végig biztos kézzel követted a húsvéti történet ívét.";
  }

  if (ratio >= 0.7) {
    return "Erős alapokkal haladsz. A magyarázatok segítenek a finomabb részletekben.";
  }

  if (ratio >= 0.4) {
    return "Jó kiindulópont. Érdemes a válaszok utáni rövid megjegyzéseket is végigolvasni.";
  }

  return "Ez most inkább nyitány. A visszajelzésekből gyorsan áttekintheted a fő állomásokat.";
}

export function QuizExperience({ content }: QuizExperienceProps) {
  const [answers, setAnswers] = useState<Record<string, QuizOptionId>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = content.questions.length;
  const score = content.questions.reduce((total, question) => {
    return total + (answers[question.id] === question.correctOptionId ? 1 : 0);
  }, 0);

  function handleAnswerChange(questionId: string, optionId: QuizOptionId) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionId,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (answeredCount !== totalQuestions) {
      return;
    }

    setSubmitted(true);
  }

  function handleReset() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{husvetSite.domain} / kvíz</p>
          <h1>{content.title}</h1>
          <p className={styles.lead}>{content.intro}</p>
        </div>

        <aside className={styles.progressPanel}>
          <p className={styles.progressLabel}>Állapot</p>
          <strong>
            {answeredCount}/{totalQuestions}
          </strong>
          <p>
            {submitted
              ? `Kész. ${score} helyes válaszod van.`
              : "Jelöld meg mindegyik kérdésnél a szerinted helyes választ."}
          </p>
        </aside>
      </section>

      <form className={styles.quizForm} onSubmit={handleSubmit}>
        <ol className={styles.questionList}>
          {content.questions.map((question, index) => {
            const selectedAnswer = answers[question.id];
            const isCorrect = selectedAnswer === question.correctOptionId;

            return (
              <li className={styles.questionItem} key={question.id}>
                <article className={styles.questionCard}>
                  <div className={styles.questionMeta}>
                    <span>{(index + 1).toString().padStart(2, "0")}</span>
                    <span>{question.reference}</span>
                  </div>

                  <h2>{question.prompt}</h2>

                  <div className={styles.options}>
                    {question.options.map((option) => {
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
                            name={question.id}
                            onChange={() =>
                              handleAnswerChange(question.id, option.id)
                            }
                            type="radio"
                            value={option.id}
                          />
                          <span className={styles.optionKey}>{option.id.toUpperCase()}</span>
                          <span>{option.text}</span>
                        </label>
                      );
                    })}
                  </div>

                  {submitted ? (
                    <div
                      className={`${styles.feedback} ${
                        isCorrect ? styles.feedbackCorrect : styles.feedbackWrong
                      }`}
                    >
                      <strong>
                        {isCorrect ? "Helyes válasz." : "Most nem ez volt a jó válasz."}
                      </strong>
                      <p>{question.explanation}</p>
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ol>

        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            disabled={answeredCount !== totalQuestions}
            type="submit"
          >
            Eredmény megtekintése
          </button>
          <button
            className={styles.secondaryAction}
            onClick={handleReset}
            type="button"
          >
            Újrakezdés
          </button>
          <Link className={styles.tertiaryAction} href="/">
            Vissza a kezdőoldalra
          </Link>
        </div>
      </form>

      {submitted ? (
        <section className={styles.resultPanel}>
          <p className={styles.resultLabel}>Összegzés</p>
          <h2>
            {score}/{totalQuestions}
          </h2>
          <p>{getResultSummary(score, totalQuestions)}</p>
        </section>
      ) : null}
    </main>
  );
}
