const mapQuery = encodeURIComponent("6500 Baja, Bezeréj P. u. 5.");

export const bajaAdventistChurch = {
  badgeEyebrow: "Baja",
  badgeLabel: "Adventista gyülekezet",
  city: "Baja",
  churchName: "Hetednapi Adventista Gyülekezet",
  address: "6500 Baja, Bezeréj P. u. 5.",
  invitationTitle: "Szeretettel várunk a bajai adventista gyülekezetbe",
  invitationCopy:
    "Ha szeretnéd személyesen is továbbvinni a húsvéttal kapcsolatos kérdéseidet, gyere el hozzánk Bajára egy barátságos bibliaköri alkalomra vagy istentiszteletre.",
  completionTitle: "Folytassuk személyesen is",
  completionCopy:
    "Ha szeretnél tovább beszélgetni a húsvét üzenetéről, a hitről vagy a Biblia reménységéről, örömmel látunk Baján egy barátságos szombati alkalmon.",
  note:
    "Nyugodtan érkezhetsz első alkalommal is. Segítünk eligazodni, és szívesen beszélgetünk veled a hitről, a feltámadás reménységéről és a Biblia üzenetéről.",
  serviceTimes: [
    {
      label: "Bibliatanulmányozás",
      value: "Szombat 9:30",
    },
    {
      label: "Istentisztelet",
      value: "Szombat 11:00",
    },
  ],
  mapEmbedSrc: `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
  directionsHref: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
  websiteHref: "https://baja.adventista.hu/",
} as const;
