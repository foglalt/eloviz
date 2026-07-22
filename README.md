# Élő Víz

Magyar nyelvű, örökzöld bibliatanulmány-gyűjtemény Next.js 16 és React 19 alapon.

## Funkciók

- Témák, PDF-tanulmányok és YouTube-videók külön, keresőbarát oldalakon.
- Több-több kapcsolat a témák között, valamint közvetlen tanulmány–videó párosítás.
- Verziózott PDF-feltöltés 12 MB-os korláttal, tartalom- és checksum-ellenőrzéssel.
- Magyar igehelyek automatikus felismerése oldal- és szövegkörnyezet-bizonyítékkal.
- Kötelező szerkesztői ellenőrzés és javítható OSIS-lista publikálás előtt.
- Egyszerű, jelszóval védett admin témákhoz, tanulmányokhoz és videókhoz.
- Magyar metaadatok, canonical URL-ek, strukturált adatok, sitemap és robots szabályok.

## Beállítás

Másold a [`.env.example`](./.env.example) fájlt `.env.local` néven, és töltsd ki:

- `DATABASE_URL`: szükséges Neon/Postgres kapcsolat.
- `ADMIN_PASSWORD`: az egyetlen szerkesztői jelszó.
- `ADMIN_SESSION_SECRET`: külön, legalább 32 karakteres véletlen munkamenet-kulcs.
- `BLOB_READ_WRITE_TOKEN`: ajánlott éles környezetben. Ha nincs beállítva, a feltöltött PDF tartós adatbázis-fallbackbe kerül.

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

## Adat- és verziómodell

Az adatbázis-migrációk a [`database`](./database) könyvtárban, az idempotens kezdő tartalom a [`data/seed-content.json`](./data/seed-content.json) fájlban található. A tanulmány új PDF-je új dokumentumverzió; a korábbi publikált verzió addig marad nyilvános, amíg az új hivatkozáslistát a szerkesztő nem véglegesíti.

Az egyszerű Biblia-olvasó és a versenkénti tanulmány-visszamutatás a következő fázis. A V1 már fordításfüggetlen OSIS-tartományokat tárol ehhez.
