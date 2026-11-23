---
phase: 04
plan: 20
status: complete
date: 2026-11-19
---

# PDF-cím és nyomtatott válaszvonalak

Az új tanulmány űrlapja PDF-választáskor hitelesített szerverakcióval az első oldal kiemelt címét olvassa ki. A lecke/melléklet számozott előtagot elhagyja; a kézzel megadott címet megtartja, a későbbi fájlra adott válaszok elsőbbségét kéréssorszám védi. Bizonytalan felismerésnél kézzel kitölthető marad.

A `pdf-layout-v7` HTML-generátor az önálló aláhúzásjeles válaszvonalakat csoportosítás előtt kihagyja; a kérdések, számozás, félkövér/spoiler és igehelyek megmaradnak. A PDF nyers szövege és fájlja nem módosul.

## Ellenőrzés

- 142 teszt, TypeScript, lint/build sikeres; a tényleges 6. PDF és egy korábbi PDF címe is helyesen felismerve.
- Forrás PDF első és negyedik oldala Popplerrel renderelve, képen ellenőrizve. Cím: „6. Lecke – A jó és rossz paradoxona”; végén négy kérdés és nyomtatott válaszvonalak.
- A 6. lecke már publikálva: study `89a20894-a52c-45ae-beb9-91afa6286031`, document `bcf563d0-0e71-470c-8a8f-63343e45c343`. A megadott helyi PDF SHA256-ja egyezik a publikált dokumentuméval.
- Privát mentés: `tmp/pdfs/lesson6-before.json`. Célzott HTML/összefoglaló javítás kipróbálva a `br-tiny-hat-ag9wgfgv` Neon ágon (projekt `autumn-band-56871098`), az éles ág másolatán. Lejárat 2026-11-20 20:00 UTC; autosuspend 300 s.
- A próbában, majd az éles célzott javítás után a négy kérdés egy listában, válaszvonalak nélkül; dokumentumazonosító/PDF/URL/nyers szöveg/publikálási dátum/végleges igehelyek változatlanok.
- Böngésző: IAB 2 / tab 1 saját tesztlap localhost:3020. Valódi 6. PDF-re automatikusan kitöltődött a cím; másik PDF kiválasztása a kézzel szerkesztett címet nem írta felül. Az olvasóoldal asztali/mobil kérdéslistája képen ellenőrizve, összefoglaló megfelelő. Az éles adminban ugyanaz a PDF sikeresen kitöltötte a címet; a lecke éles oldalán a négy kérdés válaszvonal nélkül és az új összefoglaló megjelenik.
- Kiadás: `f91dc554a01b4547eb4293c013285f05ea7585aa`, Vercel `dpl_HA4btB8jzG4Fx9AKDsgJz6A6gU6C` READY, `www.eloviz.hu` alias és egyező SHA. Error/fatal runtime napló nincs a kiadáson az ellenőrzött 10 percben. Az eredeti PDF éles letöltése byteazonos (128141 bájt).
- Saját IAB lap bezárva, üres laplista ellenőrizve, viewport visszaállítva. Éles tesztbelépés után kijelentkeztem. Az ideiglenes, kizárólag belépéshez kiolvasott adminhitelesítő fájlt eltávolítottam; gyökér `.env` nem módosult. Új teszttanulmány, dokumentumverzió vagy e-mail nem készült. Dev szolgáltatás megtartva.

## Eredmény

A feladat teljesítve; nincs hátralévő implementáció. Részletek: `04-20-VERIFICATION.md`. Az összefoglaló kézzel a lecke tartalma alapján készült, új AI-szolgáltatás nincs.
