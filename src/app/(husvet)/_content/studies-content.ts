export type StudySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type StudyTopic = {
  id: string;
  title: string;
  reference: string;
  summary: string;
  sections: StudySection[];
};

export type StudiesPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  exportNote: string;
  topics: StudyTopic[];
  seo: {
    title: string;
    description: string;
  };
};

export const studiesPageContent = {
  eyebrow: "Baja 2026 / bibliatanulmányok",
  title: "Bibliatanulmányok",
  intro:
    "A plakáton szereplő alkalmak sorrendjét követve itt találod a témákat rövid bevezetővel. Az első három tanulmány részletesebb jegyzetként is elérhető.",
  exportNote:
    "Az export a böngésző nyomtatási nézetét nyitja meg, ahol PDF-ként is elmentheted a témákat.",
  topics: [
    {
      id: "a-husvet-eredete-a-paszka-szimbolikaja",
      title: "A húsvét eredete: a páska szimbolikája",
      reference: "Csütörtök 20:30 · 2Mózes 12:1-28",
      summary:
        "Megvizsgáljuk a húsvét eredetét leíró történetet.",
      sections: [
        {
          title: "Árnyék és valóság",
          paragraphs: [
            "A páska története nem önmagáért áll az Írásban: a szabadítás eseménye Krisztus felé mutató előkép (Zsidók 10:1; 1Korinthus 10:11; Kolossé 2:17).",
            "Mózes személye is előkép, de a valóság nagyobb az árnyéknál: Krisztus felülmúlja az előképet (5Mózes 18:15-18; Zsidók 3:1-3)."
          ],
        },
        {
          title: "Mózes és Krisztus párhuzamai",
          paragraphs: [
            "A tanulmány központi gondolata, hogy a szabadítástörténet nagy íve Krisztusban teljesedik ki."
          ],
          bullets: [
            "Születésük körül veszély: 2Mózes 1:22-2:10; Máté 2:13-18.",
            "Szolgaságból szabadítás: Apostolok cselekedetei 7:34-36; János 8:31-36.",
            "A szabadító nem a bűn szolgája: Apostolok cselekedetei 7:21; 1János 3:5.",
            "A szabadítás ideje előre jelzett: 2Mózes 12:40-41; Dániel 9:24-26."
          ],
        },
        {
          title: "A páska elemei Krisztusra mutatnak",
          paragraphs: [
            "A 2Mózes 12-ben a bárány kiválasztása, hibátlansága, vére és megtörhetetlen csontjai mind Krisztus áldozatának részleteire irányítják a figyelmet.",
            "A vér nemcsak kiontva volt, hanem meghintve is: a megtisztítás a vér alkalmazásához kötődik (Zsidók 9:22; Zsidók 12:24; Róma 3:21-25; 1János 1:7)."
          ],
          bullets: [
            "2Mózes 12:2 - új kezdet.",
            "2Mózes 12:3 - a bárány előre kiválasztva (1Péter 1:19-20).",
            "2Mózes 12:5 - hibátlan bárány (Zsidók 7:26).",
            "2Mózes 12:46 - csontjai nem törhetők meg (János 19:36).",
            "2Mózes 12:8-10 - a bárány teljes elfogyasztása: Krisztus beszédének teljes befogadása (János 6:53-54,63)."
          ],
        },
        {
          title: "Válaszunk ma",
          paragraphs: [
            "A páska tipológiája gyakorlati hívás is: a régi kovász kitakarítása, vagyis a bűnhöz való ragaszkodás elhagyása (1Korinthus 5:7-8).",
            "Krisztus szolgálata nem ért véget a kereszten: meghív, hogy hittel kapcsolódjunk az Ő megtisztító és helyreállító munkájához."
          ],
        }
      ],
    },
    {
      id: "hogy-el-ne-fogyatkozzon-a-te-hited",
      title: "Hogy el ne fogyatkozzon a te hited",
      reference: "Péntek 7:30 · Lukács 22:31-34",
      summary:
        "Péter életén keresztül betekintést nyerhetünk az isteni bűnbocsánat rejtelmeibe.",
      sections: [
        {
          title: "Péter története: bukásból helyreállásig",
          paragraphs: [
            "Jézus előre jelzi Péter próbatételét, és közbenjár érte: \"imádkoztam érted, hogy el ne fogyatkozzék a hited\" (Lukács 22:31-34).",
            "Péter megtagadja Krisztust (Lukács 22:54-64), mégsem marad remény nélkül: az üres sír híre újra mozgásba hozza hitét (Lukács 24:1-12).",
            "A helyreállítás János 21:15-17-ben teljesedik ki, ahol Jézus újra szolgálatba állítja Pétert."
          ],
        },
        {
          title: "A bűnbocsánat alapja",
          paragraphs: [
            "A megbékélés középpontja Krisztus áldozata: Isten Krisztusban megbékéltette magával a világot (2Korinthus 5:17-21).",
            "Ezért nem nekünk kell hordozni a bűn ítéletét: Jézus elszenvedte azt, ami minket illetett (János 12:27; Lukács 22:42)."
          ],
          bullets: [
            "Az ítélet pohara az Írásban: Zsoltárok 75:9; Jeremiás 25:15; Ézsaiás 51:17; Ezékiel 23:33.",
            "Krisztus kiitta a poharat, hogy nekünk ne kelljen az ítéletet hordoznunk.",
            "Aki visszautasítja az áldozatát, maga marad az ítélet terhe alatt (Jelenések 14:10; Jelenések 16)."
          ],
        },
        {
          title: "Krisztus közbenjárása ma is élő remény",
          paragraphs: [
            "Ahhoz, hogy valódi Megváltónk lehessen, Krisztus teljesen emberré lett és bűntelenül élt helyettünk (Róma 8:3; Galata 4:4; Filippi 2:5-8; Zsidók 2:14-18; 1Péter 2:22-24).",
            "Minden kísértésünkben és fájdalmunkban érthet minket, ezért bátran közeledhetünk hozzá (Zsidók 4:15-16).",
            "Jézus nemcsak Péterért imádkozott, hanem minden későbbi hívőért is (János 17:20; Zsidók 7:25)."
          ],
        }
      ],
    },
    {
      id: "az-uj-szovetseg",
      title: "Az új szövetség",
      reference: "Péntek 21:00 · 1Korinthus 11:24-26",
      summary:
        "Szövetségkötések Istennel, miért különleges az Úrvacsora?",
      sections: [
        {
          title: "Korábbi szövetségkötések",
          paragraphs: [
            "A bibliai történetben Isten több alkalommal megerősítette szövetségét népével. Ezek mind előkészítik az Új szövetség megértését.",
            "A tanulmány az Ábrámmal, Izsákkal, Jákobbal és Izraellel kötött szövetségi állomásokból indul ki."
          ],
          bullets: [
            "Ábrám: 1Mózes 15:5-18; 1Mózes 17:1-11.",
            "Izsák: 1Mózes 26:24.",
            "Jákob: 1Mózes 28:11-22; 1Mózes 32:21-30.",
            "Mózes és Izrael népe: 2Mózes 24:1-8."
          ],
        },
        {
          title: "A páska emlékezete és fordulata Krisztusban",
          paragraphs: [
            "Izrael történelmében a páska újra és újra a szabadítás emléke lett, mégis húsvétkor fordulóponthoz ért: Krisztusban teljesedik ki, amit jelképezett.",
            "A nép vezetői elutasították Isten küldöttét, ezért vált nyilvánvalóvá, hogy szükség van az Új szövetségre, mert a régit megtörték."
          ],
          bullets: [
            "Páska-megújítás Józsué idejében: Józsué 5:2-12.",
            "Páska-megújítás Jósiás idejében: 2Királyok 23:21-25.",
            "Páska-megújítás Ezsdrás idejében: Ezsdrás 6:18-22.",
            "Elutasítás és figyelmeztetés: Apostolok cselekedetei 7:51-54; Lukács 19:41-44; Lukács 20:9-19.",
            "Krisztus nagyobb minden prófétánál: Zsidók 1:1-3; Zsidók 3:3."
          ],
        },
        {
          title: "Az Új szövetség ígérete és pecsétje",
          paragraphs: [
            "Krisztus jobb szövetség közbenjárója, amelyet az Írás már előre kijelentett (Zsidók 8:6-13; Jeremiás 31:31-34).",
            "Az Új szövetség részeseit Isten Lelkének pecsétje jelöli meg, ezért az Úrvacsora egyszerre emlékezés Krisztus áldozatára és előretekintés az Ő eljövetelére."
          ],
          bullets: [
            "A Lélek pecsétje: 2Korinthus 1:22; 2Korinthus 5:5; Efézus 1:13-14.",
            "Úrvacsora alapigéje: 1Korinthus 11:24-26 (új testamentom = új szövetség).",
            "A szövetséget Krisztus vére szenteli meg: Zsidók 9:18-22."
          ],
        },
        {
          title: "Kenyér, pohár és lábmosás",
          paragraphs: [
            "A kenyér Krisztus testére, vagyis az életadó Igére mutat (János 6:47-58). A manna képe is ezt készítette elő: nem csupán testi, hanem lelki eledelként.",
            "A lábmosásban Krisztus alázatot és szolgáló szeretetet tanít, miközben a megtisztítás szükségét is láthatóvá teszi."
          ],
          bullets: [
            "Manna és romlatlanság képei: Zsoltárok 16:10; 2Mózes 16:19-24.",
            "A lelki eledel hangsúlya: 5Mózes 8:3; 1Korinthus 10:1-4.",
            "Lábmosás mint minta: Lukács 22:25-27; János 13:1-17."
          ],
        },
        {
          title: "Gyakorlati hívás",
          paragraphs: [
            "Tanuljunk Krisztustól alázatot, fogadjuk el a megtisztítását, és vegyük az Igét mindennapi táplálékként.",
            "Az Úrvacsora így nem csak múltbeli emlék, hanem jelenidejű szövetségi élet Krisztussal."
          ],
        },
      ],
    },
    {
      id: "krisztus-akiben-minden-igeret-beteljesedik",
      title: "Krisztus, akiben minden ígéret beteljesedik",
      reference: "Szombat 8:00",
      summary:
        "Kevésbé ismert Krisztusra mutató szakaszok az ószövetségben.",
      sections: [
        {
          title: "Rövid bevezető",
          paragraphs: [
            "A fókusz azon a bibliai íven lesz, amelyben az ószövetségi ígéretek Jézus Krisztus személyében és művében nyernek beteljesedést.",
            "A részletes jegyzet feltöltése folyamatban van."
          ],
        },
      ],
    },
    {
      id: "az-igazsagnak-ama-lelke",
      title: "Az igazságnak ama Lelke",
      reference: "Szombat 19:30",
      summary:
        "Krisztus ígéretének beteljesedése pünkösdkor, a Szentlélek munkássága.",
      sections: [
        {
          title: "Rövid bevezető",
          paragraphs: [
            "Ez a tanulmány pünkösd eseményére, valamint a Szentlélek vezetésére és szolgálatára összpontosít.",
            "A részletes jegyzet feltöltése folyamatban van."
          ],
        },
      ],
    }
  ],
  seo: {
    title: "Bibliatanulmányok",
    description:
      "A baja 2026-os bibliatanulmányok plakát szerinti sorrendben, rövid bevezetőkkel és bővíthető témablokkokkal.",
  },
} satisfies StudiesPageContent;
