---
phase: 04
plan: 20
date: 2026-11-19
status: passed_local_and_content
---

# PDF-cím és válaszvonalak ellenőrzése

## Működés

- PDF-választás → hitelesített szerverakció → méret és PDF-fejléc ellenőrzése → PDF.js első oldal → tipográfia alapján kiválasztott cím → szerkeszthető mező. Nincs fájlmentés vagy külső AI-hívás a cím felismerésekor.
- A „6. Lecke – A jó és rossz paradoxona” cím „A jó és rossz paradoxona” alakban töltődik be. A fájlnév nem szolgál címként, bizonytalan első oldalnál kézi bevitelt kér. Feliratozott mező és élő állapotjelzés, meglévő beírt szöveg védelme, későn visszaérkező válaszok kizárása.
- A kizárólag aláhúzásjelekből álló válaszvonalak a HTML blokképítése előtt kiesnek. A szövegbe ágyazott kitöltendő helyek és az aláhúzott valódi szöveg megmaradnak; a PDF és nyers kinyert szövege változatlan.

## Tesztek és build

- 142/142 teszt sikeres, 0 hiba (`src/lib` és `scripts` összes tesztje; napló `tmp/pdf-title-tests.log`). Új esetek: számozott/sortördelt cím, kisebb fejléc, jelentéssel bíró szám a címben, bizonytalan/túl hosszú cím, valódi PDF.js-címkiolvasás és önálló válaszvonalak elhagyása a formázás megtartásával.
- TypeScript sikeres. `scripts/gtd.ps1 verify -Phase 04`: lint és build sikeres; részletes napló `04-VERIFICATION.md`.
- React-áttekintés: nincs új Effect vagy kliensoldali PDF.js csomag. A címfelismerés eseménykezelőben fut, csak az interaktív cím/fájl mező klienskomponens; a mentés meglévő React Action folyamatát megtartottam.

## Konkrét lecke és adatjavítás

- A felhasználó által megadott 6. PDF első/utolsó oldala renderelve: `tmp/pdfs/lesson6-first.png`, `tmp/pdfs/lesson6-last.png`; képi ellenőrzés sikeres.
- Study `89a20894-a52c-45ae-beb9-91afa6286031`, document `bcf563d0-0e71-470c-8a8f-63343e45c343`. Helyi forrás PDF hash egyezik a publikált dokumentuméval.
- Javítás előtt privát mentés: `tmp/pdfs/lesson6-before.json` (HTML, összefoglaló, revízió, dokumentum és végleges igehelyek ellenőrzőösszege).
- Először az éles adatbázis másolatán: Neon `autumn-band-56871098` / `br-tiny-hat-ag9wgfgv` (`codex-pdf-title-20261119`), majd ugyanaz a feltételes tranzakció az éles ágon. Összefoglaló és HTML változott; PDF-azonosító, SHA256, tárolási hely, nyers kinyert szöveg, URL, cím, publikálási dátum és végleges igehelyek egyeznek az előzetes mentéssel.
- `pdf-layout-v7` végén négy kérdés egy listában, aláhúzássorok nélkül. Az összefoglaló kézzel, a lecke tartalma alapján készült; nem indult új hírlevélküldés.
- A tesztág automatikus lejárata 2026-11-20 20:00 UTC, autosuspend 300 másodperc. Nincs adatbázis-sémamódosítás.

## Böngészős ellenőrzés

- Beépített IAB 2 / tab 1, saját lap, localhost:3020. Valódi 6. PDF kiválasztása kitölti a címet. Kézzel „Saját szerkesztett cím” beírva, majd a korábbi Páska PDF kiválasztva: a kézi cím megmaradt. Ürítés és új PDF után helyes automatikus cím.
- Címkitöltés képi bizonyítéka: `tmp/pdfs/title-autofill.jpg`. Nem készült új teszttanulmány vagy Blob-feltöltés.
- Olvasóoldal: az új összefoglaló megjelenik, a záró négy kérdés teljes egészében olvasható, hivatkozás link maradt, vonalak nincsenek. Asztali bizonyíték `tmp/pdfs/lesson6-clean-questions.jpg`; 390×844 mobilon képi ellenőrzés és túlcsordulásmérés sikeres (375 px oldalszélesség). Viewport visszaállítva.
- A saját lap az élő ellenőrzés végéig nyitva; utána bezárandó.

## Kiadás

Commit/push és éles build ellenőrzése folyamatban.
