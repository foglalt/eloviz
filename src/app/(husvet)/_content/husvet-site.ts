export type TimelineEvent = {
  id: string;
  span: string;
  title: string;
  reference: string;
  summary: string;
};

type HusvetSiteContent = {
  brand: string;
  domain: string;
  eyebrow: string;
  title: string;
  intro: string;
  note: string;
  quiz: {
    href: string;
    ctaLabel: string;
    secondaryLabel: string;
  };
  spotlight: {
    title: string;
    description: string;
    highlights: Array<{
      label: string;
      value: string;
    }>;
  };
  timelineTitle: string;
  timelineIntro: string;
  timeline: TimelineEvent[];
  seo: {
    title: string;
    description: string;
  };
};

export const husvetSite = {
  brand: "Élő Víz",
  domain: "husvet.eloviz.hu",
  eyebrow: "husvet.eloviz.hu | élő víz",
  title: "Húsvét, amelyből élet fakad",
  intro:
    "Ez a kezdőoldal a betániai megkenéstől a mennybemenetelig vezeti végig Jézus húsvéti történetét. A részletes tanulmányok, a teljes idővonal és a kvíz a következő iterációkban bővülnek tovább.",
  note:
    "A mostani idővonal szándékosan vázlatos: később pontosítható igehelyekkel, részletes magyarázatokkal és gazdagabb médiatartalommal.",
  quiz: {
    href: "/kviz",
    ctaLabel: "Kvíz indítása",
    secondaryLabel: "Ugrás az idővonalhoz",
  },
  spotlight: {
    title: "Az élő víz húsvéti íve",
    description:
      "A húsvéti történet itt nemcsak eseménysor, hanem meghívás: Krisztusban megnyílik az élet forrása, amely a szenvedésen, a kereszten és a feltámadáson át vezet reménységre.",
    highlights: [
      {
        label: "Fókusz",
        value: "magyar nyelvű húsvéti áttekintés",
      },
      {
        label: "Szerkezet",
        value: "külön aldomainre előkészített kezdőoldal",
      },
      {
        label: "Következő lépés",
        value: "kvíz, tanulmányok és részletes igehelyek",
      },
    ],
  },
  timelineTitle: "Húsvéti idővonal",
  timelineIntro:
    "Az első vázlat már a teljes húsvéti ívet követi. A tartalmi részleteket később a pontos egyeztetés szerint bővíthetjük.",
  timeline: [
    {
      id: "anointing",
      span: "Előkészület",
      title: "Betániai megkenés",
      reference: "Máté 26; János 12",
      summary:
        "Jézus megkenése előrevetíti a közelgő szenvedést, miközben a tanítványok még nem látják teljesen, mi készül.",
    },
    {
      id: "entry",
      span: "Nagyhét kezdete",
      title: "Bevonulás Jeruzsálembe",
      reference: "Máté 21",
      summary:
        "A király érkezik, de nem földi hatalommal. A hozsannát hamarosan elutasítás és ítéletvágy váltja fel.",
    },
    {
      id: "supper",
      span: "Szövetség",
      title: "Utolsó vacsora",
      reference: "Lukács 22; János 13",
      summary:
        "Jézus új szövetséget hirdet, szolgálatra tanít és olyan emlékezést ad, amely a gyülekezet életének középpontja marad.",
    },
    {
      id: "garden",
      span: "Éjszakai próba",
      title: "Getszemáné és elfogatás",
      reference: "Máté 26; János 18",
      summary:
        "Az imádság, az engedelmesség és az elhagyatottság feszültségében kezdődik el a szenvedés útja.",
    },
    {
      id: "cross",
      span: "Péntek",
      title: "Kereszt és temetés",
      reference: "Lukács 23; János 19",
      summary:
        "A kereszt a megváltás középpontja: Jézus önként vállalja a halált, majd testét sírba helyezik.",
    },
    {
      id: "resurrection",
      span: "Húsvét hajnalán",
      title: "A sír üres",
      reference: "János 20",
      summary:
        "A feltámadás nem csupán fordulat, hanem új teremtés kezdete, amelyben a reménység végérvényesen áttör.",
    },
    {
      id: "appearances",
      span: "Negyven nap",
      title: "Találkozások a feltámadott Jézussal",
      reference: "Lukács 24; János 20-21",
      summary:
        "A tanítványok, az emmausi úton járók és a kételkedők mind személyes bizonyosságot kapnak a feltámadt Krisztusról.",
    },
    {
      id: "ascension",
      span: "Beteljesedés",
      title: "Mennybemenetel",
      reference: "Apostolok cselekedetei 1",
      summary:
        "Jézus felmegy az Atyához, és küldetésbe állítja tanítványait, akik már a Lélek ígéretével tekintenek előre.",
    },
  ],
  seo: {
    title: "Húsvét az Élő Víz oldalán",
    description:
      "Magyar nyelvű húsvéti kezdőoldal kvízindítóval és a betániai megkenéstől a mennybemenetelig tartó idővonallal.",
  },
} satisfies HusvetSiteContent;
