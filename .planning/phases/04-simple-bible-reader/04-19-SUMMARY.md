---
phase: 04
plan: 19
status: complete
date: 2026-11-18
---

# 04-19: Tanulmánysorozatok mellékletei

A sorozattagság `lesson` / `supplement` típust kapott, külön sorrenddel és adatbázis-egyediséggel. A régi tagságok alapértelmezetten leckék. A két adminfelület és a nyilvános tartalomjegyzék külön kezeli a csoportokat; a leckenavigáció nem vezet mellékletre. A melléklet ugyanazt az olvasót, PDF-et, Biblia-hivatkozásokat és felfedhető válaszokat használja. A darabszámok, strukturált adatok és heti értesítő is jelölik a típust.

## Ellenőrzés eddig

- 137 teszt, TypeScript, lint és build sikeres.
- Neon projekt `autumn-band-56871098`, elkülönített ág `br-wild-bird-ag7mt3p5` (`codex-series-supplements-20261118`). A 011 migráció sikeres az elkülönített és az éles adatbázison is. Éles migráció előtt/után a tanulmányok, dokumentumok, igehelyek és tagságok ellenőrzőösszege egyezett.
- `verify-study-series.ts`: csoportonkénti rendezés/tömörítés, típusváltás, áthelyezés, teljes csoportcsere, ütközés, visszagörgetés, konkurens mentés és elavult szerkesztés védelme sikeres.
- `verify-study-creation.ts`: publikált/vázlat PDF, PDF nélküli vázlat, hibás téma/slug/revízió és rollback sikeres.
- Elkülönített helyi Next dev: localhost:3019. Böngészőpróba: vegyes/csak mellékletes/csak leckés sorozat, nyilvános szűrés, utolsó lecke navigációja, melléklet HTML/Biblia/spoiler és mobil nézet sikeres. Admin átrendezés, típusváltás, áthelyezés és vázlatmentés sikeres. A próba során talált üres PDF-mező feldolgozási hibája javítva és tesztelve.
- Saját böngészőlap: IAB 2 böngésző, 1 lap; bezárva és üres laplistával ellenőrizve. Más lapot nem módosítottam. Az elkülönített böngészős tesztadatok eltávolítva. A tesztág 300 másodperces autosuspenddel megmaradt; a Neon kezelőeszközök a folytatáskor már nem voltak elérhetők, lejáratot/törlést nem állítottam.
- Commit/push: `d4aa693d4647d80ef9860daf78e0fc8368d7ed47`; Vercel `dpl_CDrqV5ybaJZ8Mk853C8QFA8pCAbh` READY, `www.eloviz.hu` alias sikeres. Éles sorozatlista, tartalomjegyzék, megmaradt lecke-URL és utolsó lecke navigáció ellenőrizve; nincs alkalmazási error/fatal napló a kiadáson. A Cloudflare iframe saját konzolüzenetei nem alkalmazási hibák.

## Későbbi bővítés

Részletes bizonyíték: `04-19-VERIFICATION.md`. Konkrét forrásanyag feltöltése nem része a feladatnak; leckéhez ajánlott mellékletek későbbi bővítés.
