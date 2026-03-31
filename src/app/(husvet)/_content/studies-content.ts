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
  eyebrow: "Élő Víz / tanulmányok",
  title: "Bibliai tanulmányi témák",
  intro:
    "Ezek a témák vázlatos, de már használható tanulmányindítók. Minden blokk külön nyitható meg, a PDF export pedig egyben nyomtatja ki az összes anyagot.",
  exportNote:
    "Az export a böngésző nyomtatási nézetét nyitja meg. Ott PDF-ként is elmentheted az összes témát a teljes tartalommal együtt.",
  topics: [
    {
      id: "elo-viz",
      title: "Az élő víz ígérete",
      reference: "János 4,7-26; János 7,37-39",
      summary:
        "Jézus nemcsak egy új tanítást ad, hanem magát nevezi annak a forrásnak, amely valódi belső életet és megújulást ad.",
      sections: [
        {
          title: "Megfigyelés",
          paragraphs: [
            "A samáriai asszonnyal folytatott beszélgetésben Jézus a mindennapi szomjúságból indul ki, de hamar a szív mélyebb hiányaira mutat rá.",
            "Az élő víz képe azt hangsúlyozza, hogy Istennél nem pusztán egyszeri segítség van, hanem folyamatos, belülről fakadó élet."
          ],
        },
        {
          title: "Mit emel ki ez a téma?",
          paragraphs: [
            "Az ember sokszor külső megoldásokkal próbálja betölteni azt az űrt, amelyet csak Krisztus tud valóban elérni.",
            "A Szentlélek ígérete azt mutatja, hogy a hit nem száraz vallásosság, hanem átformáló jelenlét."
          ],
          bullets: [
            "A forrás nem bennünk indul, hanem Jézusból fakad.",
            "Az élő víz egyszerre vigasztal és tisztít.",
            "A kapott élet túlcsordulhat mások felé is."
          ],
        },
      ],
    },
    {
      id: "kereszt",
      title: "A kereszt középpontja",
      reference: "Ézsaiás 53; Lukács 23; 1Péter 2,24",
      summary:
        "A kereszt nem pusztán tragikus végpont, hanem az a hely, ahol Isten szeretete és igazsága egyszerre válik láthatóvá.",
      sections: [
        {
          title: "Megfigyelés",
          paragraphs: [
            "A szenvedéstörténetben Jézus nem sodródó áldozatként jelenik meg, hanem olyan Megváltóként, aki tudatosan vállalja az engedelmesség útját.",
            "Az ószövetségi prófétai háttér segít megérteni, hogy a kereszthalál nem véletlen fordulat, hanem Isten előre kijelentett megváltó terve."
          ],
        },
        {
          title: "Mit emel ki ez a téma?",
          paragraphs: [
            "A bűn súlya valódi, de Isten kegyelme nem kisebb annál. A kereszt ennek a találkozási pontja.",
            "A keresztény reménység ezért nem önigazolásra, hanem Krisztus befejezett művére épül."
          ],
          bullets: [
            "A kereszt egyszerre leleplezi a bűnt és hirdeti a kegyelmet.",
            "Jézus helyettes áldozata személyes és közösségi jelentőségű.",
            "A bocsánat nem olcsó, hanem megfizetett ajándék."
          ],
        },
      ],
    },
    {
      id: "feltamadas",
      title: "A feltámadás mint új kezdet",
      reference: "János 20; 1Korinthus 15,12-22",
      summary:
        "A feltámadás nem csupán vigasztaló utóhang, hanem annak a bizonyossága, hogy Krisztus valóban legyőzte a halált és új teremtést nyitott meg.",
      sections: [
        {
          title: "Megfigyelés",
          paragraphs: [
            "Az üres sír önmagában még kérdéseket hagy nyitva, de a feltámadott Jézussal való találkozások fokozatosan bizonyossággá érnek.",
            "Pál azért teszi a feltámadást a hit szívébe, mert nélküle az evangélium legfeljebb erkölcsi bátorítás maradna."
          ],
        },
        {
          title: "Mit emel ki ez a téma?",
          paragraphs: [
            "A feltámadás azt jelenti, hogy a remény nem hangulat, hanem történeti és teológiai állítás.",
            "A hívő élet ezért nem a veszteség tagadása, hanem a végső győzelem elővételezése."
          ],
          bullets: [
            "Krisztus feltámadása a mi jövőnk záloga.",
            "A félelem és a gyász nem az utolsó szó.",
            "Az új élet már most elkezdődhet a hívő emberben."
          ],
        },
      ],
    },
    {
      id: "kuldetes",
      title: "Küldetés a feltámadott Úrtól",
      reference: "Máté 28,16-20; Apostolok cselekedetei 1,6-11",
      summary:
        "A húsvéti történet nem zárul be a tanítványok belső vigasztalásába: a feltámadott Krisztus népet formál és küldetésbe állít.",
      sections: [
        {
          title: "Megfigyelés",
          paragraphs: [
            "A misszió parancsa nem emberi ambícióból fakad, hanem abból, hogy minden hatalom Krisztusé mennyen és földön.",
            "A mennybemenetel nem távolodásként jelenik meg, hanem annak a jeleként, hogy Jézus uralma már elkezdődött."
          ],
        },
        {
          title: "Mit emel ki ez a téma?",
          paragraphs: [
            "A tanítványi lét nem csupán befogadás, hanem továbbadás is. A megismert kegyelem közösségi irányt ad.",
            "Az egyház küldetése nem önmaga fenntartása, hanem Krisztus tanúbizonyságának hordozása."
          ],
          bullets: [
            "A küldetés alapja Krisztus tekintélye.",
            "A küldetés ereje a Szentlélek ígéretéhez kötődik.",
            "A tanítványi élet egyszerre tanulás és továbbadás."
          ],
        },
      ],
    },
  ],
  seo: {
    title: "Bibliai tanulmányok",
    description:
      "Megnyitható és PDF-be exportálható bibliai tanulmányi témák az Élő Víz húsvéti oldalán.",
  },
} satisfies StudiesPageContent;
