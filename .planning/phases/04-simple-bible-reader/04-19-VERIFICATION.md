---
phase: 04
plan: 19
date: 2026-11-18
status: passed
---

# 04-19 ellenőrzés

**Folyamat:** a szerkesztő csoportot választ és rendez az adminban → hitelesített szerverakció validál és tranzakcióban ment → csoportonként rendezett, publikálási szabályokkal szűrt sorozat és tanulmányolvasó jelenik meg.

## Automatikus ellenőrzések

- 137 teszt sikeres (`node --experimental-strip-types --test` az összes `src/lib` és `scripts` tesztre); 0 hiba. Helyi napló: `tmp/series-supplements-tests.log`.
- `npx tsc --noEmit` sikeres.
- `scripts/gtd.ps1 verify -Phase 04`: lint és produkciós build sikeres. Részletes kimenet: `04-VERIFICATION.md`.
- React-ellenőrzés: a nyilvános csoportlisták szerverkomponensek, a két interaktív adminhatár használ állapotot; nincs új Effect, a rendezés nem módosítja a bemeneti tömböket. Feliratozott típusválasztók, billentyűzetes gombok és állapotközlés.
- Hírlevél-lekérdezés vegyes típusokkal lefutott az elkülönített adatbázison; helyes lecke/melléklet feliratot és sorrendet teszt ellenőriz. Levelet nem küldtem.

## Elkülönített adatbázis

- Projekt: `autumn-band-56871098`; tesztág: `br-wild-bird-ag7mt3p5`, neve `codex-series-supplements-20261118`, forrás: `br-falling-thunder-aguj6eef`. A helyi ellenőrző alkalmazás kizárólag ezt használta (localhost:3019).
- 011 migráció sikeres; régi tagság alapértéke `lesson`; egyediség `(series_id, kind, position)`, tranzakció végéig halasztható.
- `verify-study-series.ts`: beszúrás, átrendezés, törlés utáni csoporttömörítés, típusváltás, sorozatváltás, két csoport teljes cseréje, ütközés, hibás típus elutasítása, rollback, konkurens mentés, elavult revízió elutasítása sikeres. Az ellenőrző saját adatait eltávolította.
- `verify-study-creation.ts`: publikált lecke-PDF, publikált melléklet-PDF, vázlat-PDF, PDF nélküli vázlat, hibás téma, ütköző slug/revízió. Minden esetben a dokumentum, HTML, igehelyek és kapcsolatok ellenőrizve, majd ugyanabban a tranzakcióban visszagörgetve.

## Böngésző: asztali és 390 px mobil

- Vegyes sorozat: két csoport, saját számozás és darabszám. Vázlat/PDF nélküli melléklet rejtve; a későbbi publikált melléklet eredeti sorszámát megőrzi.
- Csak leckés sorozat: nincs üres mellékletcsoport. Csak mellékletes sorozat: nincs nem létező leckére vezető kezdőgomb.
- Utolsó lecke: csak előző lecke és tartalomjegyzék; nincs továbbvezetés mellékletre. Melléklet: helyes minősítés, sorozatnév és tartalomjegyzék, nincs félrevezető leckenavigáció.
- Melléklet HTML: rejtett válasz felfedhető; a benne lévő János 3:16 link megnyitja a meglévő Biblia-oldalsávot/mobil olvasót; teljes bibliai szöveg betöltődött.
- PDF: a meglévő Nyomtatás link helyes; HTTP 200, application/pdf, `%PDF` fejléc, 1115 bájt; SHA256 `999d8b5eb77110a1cc8328b99374168635b9312247a3505c72901bf3a315252c`. A beépített böngésző natív PDF-megjelenítője üres képet adott, ezért a képi renderelés abból nem igazolható.
- Admin sorozat: típusváltás, csoporton belüli sorrend, eltávolítás/visszaadás és mentés sikeres; mentés után helyes típusok/sorszámok.
- Admin tanulmány: másik sorozatba és másik csoportba helyezés, majd visszaállítás sikeres. Új melléklet a saját következő sorszámát ajánlja (5), leckére váltva a leckékét (3); létrehozott mellékletvázlat helyesen az 5. melléklet.
- Mobilon a típus/sorszám mezők egymás alá kerülnek; rendezőgombok elérhetők, vízszintes túlcsordulás nincs (390 px viewport, 375 px tartalomszélesség).
- Talált és javított regresszió: a React üres feltöltési mezőt 0 bájtos `blob` néven küldte; ezt nem választott fájlként kezeljük. Valóban kiválasztott üres PDF továbbra is hibát kap. Új célzott teszt és böngészős vázlatmentés sikeres.
- Képi bizonyíték: `tmp/series-supplements-admin.jpg`. Saját lap: IAB 2 / tab 1; élő ellenőrzés után bezárva, üres laplista ellenőrizve, más lap nem változott. Viewport visszaállítva. A saját tesztadatokat az elkülönített ágról azonosító szerint eltávolítottam; nincs éles tesztanyag. A dev szolgáltatást nem állítottam le.
- A localhosthoz nem engedélyezett éles Turnstile-kulcs ismert 110200 hibája látszott; feliratkozást nem teszteltem és védelmet nem változtattam.

## Éles adatbázis és kiadás

- A 011 migráció az éles adatbázison is sikeres, négy utasítás egy tranzakcióban.
- Előtte/utána teljes soradatok ellenőrzőösszege egyezett: 6 tanulmány, 1 sorozat, 6 dokumentum (PDF/HTML/metaadat együtt), 5 tagság, 251 végleges igehely és 293 jelölt. Mind az 5 korábbi tagság lecke; URL, PDF, tartalom és sorrend változatlan. Privát helyi pillanatkép: `tmp/series-production-before.json`.
- Commit/push: `d4aa693d4647d80ef9860daf78e0fc8368d7ed47`; Vercel `dpl_CDrqV5ybaJZ8Mk853C8QFA8pCAbh` READY, a `www.eloviz.hu` / `eloviz.hu` aliasokkal és egyező Git SHA-val.
- Éles böngésző: sorozatlista „5 lecke”, meglévő sorozat tartalomjegyzéke „Leckék” csoporttal és üres mellékletcsoport nélkül; utolsó tanulmány stabil URL-en „5. lecke”, csak előző lecke és visszaút a tartalomjegyzékhez. A Cloudflare iframe konzolüzenetei mellett alkalmazási hibát nem találtam.
- Kiadásra szűrt Vercel runtime error/fatal napló, utolsó 10 perc: nincs találat.
- Lezáró `scripts/gtd.ps1 health` sikeres; `progress`: 19/19 kész terv, 0 befejezetlen terv. A kiadás utáni követő commit csak a projektmemória lezárását tartalmazza.
- A Neon tesztág megmaradt 300 másodperces autosuspenddel. A folytatásban már nem volt elérhető Neon kezelőeszköz (a telepített szolgáltatás keresése után sem), ezért lejáratot/törlést nem konfiguráltam; saját tesztadat nem maradt benne.
