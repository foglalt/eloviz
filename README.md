# Élő Víz

Magyar nyelvű, örökzöld bibliatanulmány-gyűjtemény Next.js 16 és React 19 alapon.

## Funkciók

- Témák, PDF-tanulmányok és YouTube-videók külön, keresőbarát oldalakon.
- Több-több kapcsolat a témák között, valamint közvetlen tanulmány–videó párosítás.
- Verziózott PDF-feltöltés 12 MB-os korláttal, tartalom- és checksum-ellenőrzéssel.
- Magyar igehelyek automatikus felismerése oldal- és szövegkörnyezet-bizonyítékkal.
- Automatikusan véglegesített OSIS-hivatkozások és PDF-ből készülő HTML olvasási nézet.
- Sorrendbe rendezett tanulmánysorozatok, önálló fejezetoldalak, tartalomjegyzék és előző/következő rész.
- Egyszerű, jelszóval védett admin témákhoz, tanulmányokhoz és videókhoz.
- Magyar metaadatok, canonical URL-ek, strukturált adatok, sitemap és robots szabályok.

## Beállítás

Másold a [`.env.example`](./.env.example) fájlt `.env.local` néven, és töltsd ki:

- `DATABASE_URL`: szükséges Neon/Postgres kapcsolat.
- `ADMIN_PASSWORD`: az egyetlen szerkesztői jelszó.
- `ADMIN_SESSION_SECRET`: külön, legalább 32 karakteres véletlen munkamenet-kulcs.
- Vercel Blob: éles környezetben privát Blob tárhely szükséges. A `BLOB_STORE_ID` a Vercel kéréshez tartozó rövid életű OIDC-hitelesítést használja; a régi `BLOB_READ_WRITE_TOKEN` megoldás is támogatott. Éles környezetben Blob-konfiguráció nélkül a PDF-feltöltés hibával leáll. Az adatbázis-fallback csak helyi fejlesztésben engedélyezett.

## Parancsok

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Minőségellenőrzés:

```bash
npm run test:references
npm run lint
npm run build
```

Az admin a `/admin` útvonalon érhető el. A publikált PDF-ek a jogosultságot és publikációs állapotot ellenőrző `/api/documents/[id]` útvonalon keresztül nyílnak meg.

## Tanulmánysorozatok

A `/admin/sorozatok` oldalon hozhatsz létre sorozatot saját címmel, bemutatással,
opcionális szerzővel és forráshivatkozással. Meglévő tanulmányokat adhatsz hozzá,
a részeket nyilakkal rendezheted, vagy a **+ Új rész hozzáadása** gombbal
előkészítheted a következő fejezetet. Ilyenkor a sorozat, a sorszám és az előző
rész témái már ki vannak választva. Minden fejezethez külön PDF-et tölts fel.

Egy tanulmány egy sorozat része lehet. A tanulmány szerkesztőjében módosíthatod
a sorozatot és a helyét, vagy önálló tanulmánnyá alakíthatod. A sorozatból való
eltávolítás nem törli a tanulmányt vagy a PDF-et.

A sorozat és a fejezetek külön publikálhatók. A `/sorozatok` és
`/sorozatok/[slug]` oldalakon csak a publikált, PDF-fel rendelkező részek jelennek
meg; a vázlatok sorszámai a szerkesztőségben megmaradnak. A fejezetek önálló
`/tanulmanyok/[slug]` címei megmaradnak. A korábbi kapcsolódó tanulmányok adatai
nem vesznek el, de a sorozat tagságát és sorrendjét a szerkesztő határozza meg.

Ellenőrzés: `npm run test:series`. A `node --env-file=.env --experimental-strip-types scripts/verify-study-series.ts`
parancs ideiglenes adatbázis-rekordokon ellenőrzi a beszúrást, átrendezést,
áthelyezést, visszagörgetést és párhuzamos mentést, majd eltávolítja a tesztadatokat.

## Adat- és verziómodell

Az adatbázis-migrációk a [`database`](./database) könyvtárban, az idempotens kezdő tartalom a [`data/seed-content.json`](./data/seed-content.json) fájlban található. A tanulmány új PDF-je új dokumentumverzió; a sikeres feldolgozás automatikusan véglegesíti az új hivatkozáslistát és a HTML olvasási nézetet.

Az egyszerű Biblia-olvasó és a versenkénti tanulmány-visszamutatás a következő fázis. A V1 már fordításfüggetlen OSIS-tartományokat tárol ehhez.
