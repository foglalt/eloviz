# Hírlevélszolgáltató váltása

Az Élő Víz saját Postgres-adatbázisa tárolja a címeket, a hozzájárulás és az
e-mailes megerősítés időpontját, a feliratkozási állapotot és a heti küldések
tartalmát. A levélsablon és az időzítés saját kód. A szolgáltató cserélhető, de
a jelenlegi küldő-, kontakt- és webhookkód Resendhez kötött; a cél kiválasztása
után külön implementáció és ellenőrzött átállás szükséges.

## Mentés

Az admin **Feliratkozók → Teljes mentés letöltése** gombja egy verziózott JSON
fájlt készít. A mentés bejelentkezéshez kötött, nem gyorsítótárazható, és nem
küld levelet vagy módosít feliratkozást. Teljes hozzáférésű Resend-kulcs kell.

- `subscribers`: minden helyi cím, hozzájárulás, megerősítés és állapot.
- `eligible`: csak helyileg aktív, megerősített, Resendben aktív és a saját
  értesítési listán jelen lévő, tiltás nélküli cím.
- `blocked`: helyi/szolgáltatói leiratkozás vagy szolgáltatói tiltás. Ezeket
  először a cél szolgáltató **ne küldj** listájára kell importálni.
- `pending`: megerősítésre vár; nem szabad aktívként importálni.
- `review`: hiányzó vagy ellentmondó megerősítés/szolgáltatói tagság;
  ellenőrzésig nem kaphat levelet.
- `digestRuns` és `sourceBroadcasts`: időszakok, tartalmi pillanatképek,
  szolgáltatói azonosítók/állapotok. Az azonosítók történeti bizonyítékok;
  az új szolgáltatónál nem használhatók küldési célként.
- `cutoverBlockers`: aktív küldés, függő küldések, tisztázatlan címek jelzése.
  A hiányzó akadály önmagában nem jóváhagyás: mindig kell végső egyeztetés.

A Resend-listák minden oldala lekérdezésre kerül. A fiók más projektjeinek
címei nem kerülnek a mentésbe. Hibás/hiányos szolgáltatói válasznál vagy export
közben változó helyi adatoknál az egész letöltés hibával leáll.

Az adatbázis és a Resend között nincs közös tranzakció. A mentés egy időben
korlátozott pillanatkép, nem a későbbi import idejére garantált végállapot.
Az export nem tartalmaz API-kulcsot, webhooktitkot vagy megerősítő tokent.

## Átállási sorrend

1. Válaszd ki a cél szolgáltatót az akkori lista, küldési mennyiség és ár alapján.
   Állítsd be ugyanazt a feladót (`hirlevel@eloviz.hu`), a DKIM/SPF rekordokat,
   a leiratkozást és a bounce/panasz tiltásait. Ellenőrizd a fogadó listák
   importformátumát és a hozzájárulás megőrzését.
2. Implementáld a cél kapcsolatát: megerősítő levél, kontakt aktiválása, heti
   küldés, állapotellenőrzés és aláírt webhook. Teszteld elkülönített listával,
   a cél hivatalos tesztcímével. A heti tartalmi lekérdezés és időszakok maradjanak.
3. Mindkét küldő legyen szüneteltetve. Resendnél `NEWSLETTER_ENABLED=false`
   production beállítás és új deployment szükséges. Ez a jelenlegi signup/
   megerősítés működését is szünetelteti; használj rövid karbantartási ablakot.
   A leiratkozási webhook maradjon aktív. A Resendben már sorban álló/időzített
   levelek nem állnak le ettől: ellenőrizd és várd meg vagy töröld az időzítésüket
   a szolgáltató normál felületén. Bizonytalan küldési eredményeket tisztázd.
4. Készíts friss exportot, ellenőrizd a darabszámokat és az akadályokat.
   Importáld először a leiratkozott és blokkolt címeket, aztán az engedélyezett
   címeket. A függő és ellenőrzendő címeket ne aktiváld. A régi megerősítő linkek
   72 óráig élnek: az új kapcsolatnak ezeket is kezelnie kell, vagy lejárat után
   új megerősítést kell kérni; a puszta import nem megerősítés.
5. Egyeztesd újra a késői leiratkozásokat és tiltásokat közvetlenül az indulás
   előtt. A már elküldött időszakokat ne küldd újra. Az aktuális, még el nem
   küldött időszakot egyetlen szolgáltató kapja meg.
6. Kapcsold be kizárólag az új küldőt. Figyeld az első valódi küldés eredményét,
   a tiltásokat és leiratkozásokat. A kézbesíthetőség nem vihető át garanciával;
   nagy listán fokozatos indulást és a cél útmutatását használd.

## Régi levelek és visszaállás

A már elküldött levelek Resend-féle leiratkozási linkjei nem írhatók át.
Ne töröld a régi Resend-fiókot, listát, webhookot vagy titkot, amíg ezekből
leiratkozás érkezhet. Az új szolgáltatói kapcsolatnak a régi webhookon érkező
leiratkozást is a saját tiltólistájára kell átvezetnie. A jelenlegi webhook a
helyi adatbázist frissíti; az új szolgáltató felé továbbítás még célfüggő munka.
Az új levelekhez tartós, saját domainen működő leiratkozási cím is bevezethető
az átállás részeként; a régi Resend-linkeket ez nem cseréli le.

Visszaállásnál először állítsd le az új küldőt. Vezesd vissza az ott érkezett
leiratkozásokat, tiltásokat és új hozzájárulásokat; egyeztesd a ténylegesen
elküldött heti időszakokat. Csak utána indítsd újra a régi küldőt. A korábbi
exportból történő egyszerű visszatöltés elveszítheti az új leiratkozásokat.

## Szolgáltatói dokumentáció

- [Resend: Contacts](https://resend.com/docs/api-reference/contacts/list-contacts)
- [Resend: Suppressions](https://resend.com/docs/api-reference/suppressions/list-suppressions)
- [Resend: suppression list export és tiltások](https://resend.com/changelog/suppression-list-support)

Ellenőrizve: 2026-10-13. A kész funkció a váltáshoz szükséges export és eljárás;
automatikus vagy már végrehajtott szolgáltatóváltást nem jelent.
