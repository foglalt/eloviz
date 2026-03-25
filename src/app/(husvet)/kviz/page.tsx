import type { Metadata } from "next";
import { getHusvetQuizContent } from "@/lib/husvet-quiz-store";
import { QuizExperience } from "./quiz-experience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Húsvéti kvíz",
  description: "Interaktív húsvéti kvíz a husvet.eloviz.hu oldalán.",
};

export default async function HusvetQuizPage() {
  const quizContent = await getHusvetQuizContent();

  return <QuizExperience content={quizContent} />;
}
