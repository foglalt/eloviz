import { NextResponse } from "next/server";
import { upsertHusvetQuizDeviceProgress } from "@/lib/husvet-quiz-analytics-store";
import { clampNonNegativeInt, isRecord } from "@/lib/value-utils";

type QuizProgressPayload = {
  answeredCount?: unknown;
  correctAnswers?: unknown;
  currentIndex?: unknown;
  deviceId?: unknown;
  isComplete?: unknown;
  quizSlug?: unknown;
  totalQuestions?: unknown;
};

function normalizeDeviceId(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

export async function POST(request: Request) {
  let payload: QuizProgressPayload;

  try {
    const parsedBody = (await request.json()) as unknown;

    if (!isRecord(parsedBody)) {
      return NextResponse.json(
        { message: "A kvíz-analitikai kérés nem volt értelmezhető." },
        { status: 400 },
      );
    }

    payload = parsedBody;
  } catch {
    return NextResponse.json(
      { message: "A kvíz-analitikai kérés JSON formátuma hibás." },
      { status: 400 },
    );
  }

  const deviceId = normalizeDeviceId(payload.deviceId);

  if (!deviceId) {
    return NextResponse.json(
      { message: "A kvíz-analitikai kérés nem tartalmazott eszközazonosítót." },
      { status: 400 },
    );
  }

  if (payload.quizSlug !== "husvet") {
    return NextResponse.json(
      { message: "Az analitikai kérés ismeretlen kvízre érkezett." },
      { status: 400 },
    );
  }

  const totalQuestions = clampNonNegativeInt(payload.totalQuestions);
  const answeredCount = clampNonNegativeInt(payload.answeredCount, totalQuestions);
  const currentIndex = clampNonNegativeInt(payload.currentIndex, totalQuestions);
  const correctAnswers = clampNonNegativeInt(payload.correctAnswers, answeredCount);
  const isComplete =
    payload.isComplete === true && totalQuestions > 0 && currentIndex >= totalQuestions;

  try {
    await upsertHusvetQuizDeviceProgress({
      answeredCount,
      correctAnswers,
      currentIndex,
      deviceId,
      isComplete,
      quizSlug: "husvet",
      totalQuestions,
      userAgent: request.headers.get("user-agent") ?? "",
    });

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "A kvíz-analitikai mentés nem sikerült.",
      },
      { status: 500 },
    );
  }
}
