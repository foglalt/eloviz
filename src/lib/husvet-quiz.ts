export const husvetQuizOptionIds = ["a", "b", "c", "d"] as const;

export type QuizOptionId = (typeof husvetQuizOptionIds)[number];

export type HusvetQuizOption = {
  id: QuizOptionId;
  text: string;
};

export type HusvetQuizQuestion = {
  id: string;
  prompt: string;
  reference: string;
  options: HusvetQuizOption[];
  correctOptionId: QuizOptionId;
  explanation: string;
};

export type HusvetQuizContent = {
  slug: "husvet";
  title: string;
  intro: string;
  questions: HusvetQuizQuestion[];
  updatedAt?: string | null;
};

export type HusvetQuizContentInput = Omit<HusvetQuizContent, "slug" | "updatedAt">;

type ParseSuccess = {
  success: true;
  data: HusvetQuizContentInput;
};

type ParseFailure = {
  success: false;
  message: string;
};

export type ParseQuizContentResult = ParseSuccess | ParseFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseHusvetQuizContentInput(
  payload: unknown,
): ParseQuizContentResult {
  if (!isRecord(payload)) {
    return {
      success: false,
      message: "A mentett kvíztartalom nem értelmezhető objektumként.",
    };
  }

  const title = normalizeText(payload.title);
  const intro = normalizeText(payload.intro);

  if (!title) {
    return {
      success: false,
      message: "A kvíz címe nem lehet üres.",
    };
  }

  if (!intro) {
    return {
      success: false,
      message: "A kvíz bevezetője nem lehet üres.",
    };
  }

  if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
    return {
      success: false,
      message: "Legalább egy kérdésre szükség van.",
    };
  }

  const seenIds = new Set<string>();
  const questions: HusvetQuizQuestion[] = [];

  for (const [questionIndex, rawQuestion] of payload.questions.entries()) {
    if (!isRecord(rawQuestion)) {
      return {
        success: false,
        message: `${questionIndex + 1}. kérdés: hibás adatformátum.`,
      };
    }

    const prompt = normalizeText(rawQuestion.prompt);
    const reference = normalizeText(rawQuestion.reference);
    const explanation = normalizeText(rawQuestion.explanation);
    const correctOptionId = normalizeText(rawQuestion.correctOptionId);

    if (!prompt) {
      return {
        success: false,
        message: `${questionIndex + 1}. kérdés: a kérdésszöveg kötelező.`,
      };
    }

    if (!reference) {
      return {
        success: false,
        message: `${questionIndex + 1}. kérdés: az igehely megadása kötelező.`,
      };
    }

    if (!explanation) {
      return {
        success: false,
        message: `${questionIndex + 1}. kérdés: a magyarázat kötelező.`,
      };
    }

    if (!husvetQuizOptionIds.includes(correctOptionId as QuizOptionId)) {
      return {
        success: false,
        message: `${questionIndex + 1}. kérdés: a helyes válasz nincs kiválasztva.`,
      };
    }

    if (!Array.isArray(rawQuestion.options)) {
      return {
        success: false,
        message: `${questionIndex + 1}. kérdés: a válaszlehetőségek hiányoznak.`,
      };
    }

    const options: HusvetQuizOption[] = [];

    for (const optionId of husvetQuizOptionIds) {
      const option = rawQuestion.options.find((item) => {
        return isRecord(item) && item.id === optionId;
      });

      const optionText = normalizeText(option && option.text);

      if (!optionText) {
        return {
          success: false,
          message: `${questionIndex + 1}. kérdés: minden válaszlehetőséget tölts ki.`,
        };
      }

      options.push({
        id: optionId,
        text: optionText,
      });
    }

    const rawId = normalizeText(rawQuestion.id) || `kerdes-${questionIndex + 1}`;
    const baseId = rawId.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const normalizedId = baseId.replace(/^-+|-+$/g, "") || `kerdes-${questionIndex + 1}`;
    const uniqueId = seenIds.has(normalizedId)
      ? `${normalizedId}-${questionIndex + 1}`
      : normalizedId;

    seenIds.add(uniqueId);
    questions.push({
      id: uniqueId,
      prompt,
      reference,
      options,
      correctOptionId: correctOptionId as QuizOptionId,
      explanation,
    });
  }

  return {
    success: true,
    data: {
      title,
      intro,
      questions,
    },
  };
}

export const defaultHusvetQuizContent: HusvetQuizContent = {
  slug: "husvet",
  title: "Húsvéti kvíz",
  intro:
    "Ezek a kérdések végigvezetnek a nagyhét és a feltámadás fő állomásain. Válaszolj nyugodtan, majd nézd meg a rövid igei magyarázatokat is.",
  updatedAt: null,
  questions: [
    {
      id: "bethania",
      prompt: "Melyik településen történt Jézus megkenése közvetlenül a szenvedéstörténet előtt?",
      reference: "Máté 26; János 12",
      options: [
        { id: "a", text: "Bethániában" },
        { id: "b", text: "Názáretben" },
        { id: "c", text: "Jerikóban" },
        { id: "d", text: "Kapernaumban" },
      ],
      correctOptionId: "a",
      explanation:
        "A megkenés Bethániában történt, és előre jelezte Jézus közelgő halálát és temetését.",
    },
    {
      id: "jeruzsalem",
      prompt: "Milyen kiáltással fogadta a sokaság Jézust, amikor bevonult Jeruzsálembe?",
      reference: "Máté 21,9",
      options: [
        { id: "a", text: "Dicsőség a templomnak!" },
        { id: "b", text: "Hozsánna a Dávid Fiának!" },
        { id: "c", text: "Békesség a földön!" },
        { id: "d", text: "Áldott, aki a pusztából jön!" },
      ],
      correctOptionId: "b",
      explanation:
        "A tömeg királyként köszöntötte Jézust, de nem értette még teljesen, hogy országa nem földi hatalomra épül.",
    },
    {
      id: "getsemane",
      prompt: "Hol imádkozott Jézus az elfogatása előtti éjszakán?",
      reference: "Máté 26,36",
      options: [
        { id: "a", text: "Az Olajfák hegyének kertjében, a Getsemánéban" },
        { id: "b", text: "A templom belső udvarában" },
        { id: "c", text: "Lázár sírjánál" },
        { id: "d", text: "A galileai tó partján" },
      ],
      correctOptionId: "a",
      explanation:
        "A Getsemánéban Jézus mély küzdelemben, mégis teljes engedelmességgel készült a keresztre.",
    },
    {
      id: "temetes",
      prompt: "Ki kérte el Pilátustól Jézus testét, hogy eltemethesse?",
      reference: "János 19,38",
      options: [
        { id: "a", text: "Péter apostol" },
        { id: "b", text: "Nikodémus" },
        { id: "c", text: "Arimátiai József" },
        { id: "d", text: "Cirénei Simon" },
      ],
      correctOptionId: "c",
      explanation:
        "Arimátiai József kérte el Jézus testét, Nikodémus pedig a temetéshez szükséges fűszereket vitte.",
    },
    {
      id: "ures-sir",
      prompt: "Mit találtak a sírhoz érkezők húsvét hajnalán?",
      reference: "János 20,1-8",
      options: [
        { id: "a", text: "A lezárt követ és római őröket" },
        { id: "b", text: "Az üres sírt" },
        { id: "c", text: "A tanítványokat imádkozva" },
        { id: "d", text: "Egy új oltárt a sír előtt" },
      ],
      correctOptionId: "b",
      explanation:
        "Az üres sír a feltámadás jele volt: Jézus legyőzte a halált, és új reménységet nyitott meg.",
    },
    {
      id: "negyven-nap",
      prompt: "Mennyi ideig jelent meg a feltámadott Jézus a tanítványainak a mennybemenetel előtt?",
      reference: "Apostolok cselekedetei 1,3",
      options: [
        { id: "a", text: "Hét napig" },
        { id: "b", text: "Tizenkét napig" },
        { id: "c", text: "Harminc napig" },
        { id: "d", text: "Negyven napig" },
      ],
      correctOptionId: "d",
      explanation:
        "A negyven nap alatt Jézus sok bizonyítékát adta a feltámadásnak, és felkészítette tanítványait a küldetésre.",
    },
  ],
};
