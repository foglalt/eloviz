import { isRecord, normalizeText } from "@/lib/value-utils";

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
    "Ezek a kérdések a húsvét bibliai alapjain vezetnek végig. Válaszolj nyugodtan, majd nézd meg a rövid igei magyarázatokat is. +1 bónusz: gondold át személyesen, mit jelent számodra Jézus áldozata és feltámadása.",
  updatedAt: null,
  questions: [
    {
      id: "husvet-jelkep",
      prompt: "Melyik állat köthető a bibliai húsvéthoz és kit/mit jelképez?",
      reference: "János 1:29",
      options: [
        { id: "a", text: "Nyuszi - a termékenységet" },
        { id: "b", text: "Bárány - a Megváltót" },
        { id: "c", text: "Csibe - az újjászületést" },
        { id: "d", text: "Galamb - a Szent Lelket" },
      ],
      correctOptionId: "b",
      explanation:
        "A Biblia Jézust Isten Bárányaként mutatja be: ő a Megváltó, aki értünk adta az életét.",
    },
    {
      id: "husvet-eredete",
      prompt: "Honnan ered a húsvét ünnepe? Kik tartották először?",
      reference: "5Mózes 16:1-8",
      options: [
        { id: "a", text: "Korai keresztények" },
        { id: "b", text: "Izraeliták, amikor kivonultak Egyiptomból" },
        { id: "c", text: "Izraeliták, amikor megszabadultak Babilonból" },
        { id: "d", text: "Görögök, a tavasz köszöntéseként" },
      ],
      correctOptionId: "b",
      explanation:
        "A húsvét gyökere az egyiptomi szabadulás emléknapja, amelyet Isten népe tartott meg először.",
    },
    {
      id: "mit-unneplunk-husvetkor",
      prompt: "Mit ünneplünk húsvétkor?",
      reference: "1Korinthus 15:3-4",
      options: [
        { id: "a", text: "Jézus születését" },
        { id: "b", text: "Jézus kereszthalálát és feltámadását" },
        { id: "c", text: "A tanítványok elhívását" },
        { id: "d", text: "Jézus megkeresztelkedését" },
      ],
      correctOptionId: "b",
      explanation:
        "Húsvét központja Jézus áldozata és feltámadása, amely az evangélium alapüzenete.",
    },
    {
      id: "nagypentek-esemeny",
      prompt: "Az alábbiak közül melyik esemény történt húsvét pénteken?",
      reference: "Lukács 23:46",
      options: [
        { id: "a", text: "Júdás elárulja Jézust" },
        { id: "b", text: "Az utolsó vacsora" },
        { id: "c", text: "Jézust elfogták" },
        { id: "d", text: "Jézus halála" },
      ],
      correctOptionId: "d",
      explanation:
        "Nagypénteken Jézus meghalt a kereszten. Ez a megváltás történetének központi eseménye.",
    },
    {
      id: "feltamadas-ideje",
      prompt: "Mikor támadt fel Jézus?",
      reference: "Lukács 24:1-2",
      options: [
        { id: "a", text: "Pénteken" },
        { id: "b", text: "Szombaton" },
        { id: "c", text: "Vasárnap" },
        { id: "d", text: "Sosem történt ilyen" },
      ],
      correctOptionId: "c",
      explanation:
        "A feltámadás a hét első napján, vasárnap történt. Ezért a keresztény reménység alapja az élő Krisztus.",
    },
    {
      id: "szombati-nyugalom",
      prompt: "Miért nem történt semmi Jézussal szombaton?",
      reference: "Lukács 23:57",
      options: [
        { id: "a", text: "Mert még nem jött el az ideje" },
        { id: "b", text: "Mert a tanítványok elrejtették" },
        { id: "c", text: "Mert a sír le volt zárva" },
        { id: "d", text: "Mert szombat volt és megnyugodott" },
      ],
      correctOptionId: "d",
      explanation:
        "A bibliai beszámoló szerint a szombat nyugalomnapja miatt a temetéssel kapcsolatos további teendők megálltak.",
    },
    {
      id: "halal-celja",
      prompt: "Mi volt Jézus halálának a célja?",
      reference: "2Korinthus 5:19; Ézsaiás 53:5; János 3:16",
      options: [
        { id: "a", text: "Megbékéltessen minket Istennel" },
        { id: "b", text: "Megváltson a bűnből" },
        { id: "c", text: "Új életet adjon" },
        { id: "d", text: "Az első háromból mind" },
      ],
      correctOptionId: "d",
      explanation:
        "Jézus áldozata egyszerre hoz megbékélést Istennel, szabadítást a bűnből és új életet.",
    },
    {
      id: "urvacsora-jelkepe",
      prompt: "Milyen jelképet használ Jézus arra, hogy áldozatára emlékezzünk?",
      reference: "Lukács 22:19-20; Máté 26:27-28",
      options: [
        { id: "a", text: "Olaj és só" },
        { id: "b", text: "Kovásztalan kenyér és szőlőlé" },
        { id: "c", text: "Bárány és kovásztalan kenyér" },
        { id: "d", text: "Víz és bor" },
      ],
      correctOptionId: "b",
      explanation:
        "Az úrvacsora jelképei Jézus testére és vérére emlékeztetnek, és a szövetség valóságát hirdetik.",
    },
    {
      id: "elso-talalkozas",
      prompt: "Kivel találkozott először Jézus a feltámadása után?",
      reference: "János 20:11-16",
      options: [
        { id: "a", text: "Mária Magdalénával" },
        { id: "b", text: "Édesanyjával" },
        { id: "c", text: "Tanítványokkal" },
        { id: "d", text: "Katonákkal" },
      ],
      correctOptionId: "a",
      explanation:
        "A János evangéliuma szerint a feltámadott Jézus először Mária Magdalénának jelent meg.",
    },
    {
      id: "hol-van-jezus",
      prompt: "Hol van most Jézus?",
      reference: "1Péter 3:22",
      options: [
        { id: "a", text: "Nem létezett sohasem" },
        { id: "b", text: "Még mindig a sírban" },
        { id: "c", text: "A mennyben" },
        { id: "d", text: "Nem tudom, de szívesen tudnék meg erről többet" },
      ],
      correctOptionId: "c",
      explanation:
        "A Szentírás szerint Jézus feltámadt, felment a mennybe, és ma is közbenjár értünk.",
    },
  ],
};
