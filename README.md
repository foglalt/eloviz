# Élő Víz

Magyar nyelvű, örökzöld bibliatanulmány-gyűjtemény Next.js 16 és React 19 alapon.

## Funkciók

- Témák, PDF-tanulmányok és YouTube-videók külön, keresőbarát oldalakon.
- Több-több kapcsolat a témák között, valamint közvetlen tanulmány–videó párosítás.
- Verziózott PDF-feltöltés 12 MB-os korláttal, tartalom- és checksum-ellenőrzéssel.
- Magyar igehelyek automatikus felismerése oldal- és szövegkörnyezet-bizonyítékkal.
- Automatikusan véglegesített OSIS-hivatkozások és PDF-ből készülő HTML olvasási nézet.
- Sorrendbe rendezett tanulmánysorozatok, önálló fejezetoldalak, tartalomjegyzék és előző/következő rész.
- Heti értesítő új tanulmányokról és videókról, e-mailes megerősítés, leiratkozás, admin előnézet és küldési előzmények.
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

## Heti e-mailes értesítő

Szolgáltatóváltás előkészítéséhez az admin **Feliratkozók → Teljes mentés
letöltése** gombja a saját hozzájárulási adatokat a Resend leiratkozási/tiltási
listáival egyeztetett, verziózott JSON-fájlba menti. A mentés nem változtat
szolgáltatót. A lépések, régi leiratkozási linkek és visszaállás kezelése a
[hírlevél-migrációs útmutatóban](docs/newsletter-migration.md) található.
Olvasási próba: `node --env-file=.env --experimental-strip-types scripts/verify-newsletter-export.mjs`.

A látogatók a `/feliratkozas` oldalon vagy az első látogatási ablakban kérhetik
az értesítőt. A 72 órás megerősítő link megnyitása után külön gombbal erősítik meg
a feliratkozást. Csak megerősített cím kerül a Resend külön Élő Víz-listájára.
A nyilvános feliratkozás előtt Cloudflare Turnstile ellenőrzést kérünk. A szerver
minden kérésnél ellenőrzi a tokent, a `newsletter_signup` műveletet és az
`eloviz.hu` / `www.eloviz.hu` hostnevet, még az adatbázis/Resend előtt. Hiányzó,
lejárt, újrafelhasznált token vagy szolgáltatói hiba nem indít levelet.

Turnstile beállítása: Managed widget, kizárólag a fenti éles domainekkel.
A nyilvános `NEXT_PUBLIC_TURNSTILE_SITE_KEY` és szerveroldali
`TURNSTILE_SECRET_KEY` legyen a figyelmen kívül hagyott `.env` fájlban és a Vercel
production környezetében. Kulcscsere után új build szükséges. Hiányzó kulcsoknál
az új feliratkozások szünetelnek; a megerősítés és a meglévő heti kézbesítés
változatlanul működik. Az admin jelzi a beállítás állapotát. Cloudflare tesztkulcs
csak helyi fejlesztésben használható; az éles kód elutasítja.
Próba: `node --experimental-strip-types scripts/verify-newsletter-guard.mjs`
(külső levélküldés és adatbázis-módosítás nélkül), továbbá a
`src/lib/newsletter-human-core.test.ts` tesztjei.
Forrás: https://developers.cloudflare.com/turnstile/get-started/.

A leiratkozási linket a Resend kezeli; aláírt webhook frissíti az adatbázist.

A Vercel vasárnap 18:00 UTC-kor indítja az értesítőt (Budapesten télen 19, nyáron
20 óra; a Hobby időzítés az adott órán belül indulhat). Az előző hét új, publikált,
PDF-fel rendelkező tanulmányai és videói szerepelnek benne. Sorozatrészeknél a
sorozat neve és a rész száma is megjelenik, a részek sorrendje megmarad. Üres hét
vagy megerősített feliratkozó nélküli lista esetén nem küldünk levelet.
A közzététel későbbi szerkesztése vagy új PDF-je önmagában nem új megjelenés.

Beállítás a meglévő Resend-fiókkal:

1. A titkokat a figyelmen kívül hagyott `.env` fájlba írd: `RESEND_API_KEY`
   teljes hozzáféréssel és `NEWSLETTER_FROM_EMAIL` ellenőrzött domainről.
2. Futtasd: `node scripts/setup-newsletter.mjs`. Ez külön listát és
   `contact.updated`/`contact.deleted` webhookot állít be, és biztonságosan menti
   a listaazonosítót, a webhook titkát és a véletlen `CRON_SECRET` értéket.
3. Ugyanezeket a szerveroldali értékeket állítsd be Vercel production
   környezetben. Tesztelés után `NEWSLETTER_ENABLED=true` kapcsolja be a küldést.
   Preview környezetben a küldés akkor is tiltott, ha a kapcsoló igaz.

Ingyenes Resend Marketing: 1000 névjegy, korlátlan értesítő; a külön megerősítő
levelekre napi 100 és havi 3000 a szolgáltatói keret. Az oldal napi legfeljebb
80 megerősítést kér, egy címre 10 percenként, egy hálózati címről óránként ötször.
A keretek a teljes Resend-fiókra vonatkoznak. Nincs automatikus fizetős csomagváltás.
Aktuális díjak: https://resend.com/pricing.

Az admin `/admin/feliratkozok` oldala az állapotokat, a következő heti előnézetet
és az előzményeket mutatja. A már elfogadott levél újra nem indul el. Bizonytalan
szolgáltatói válasznál ellenőrzés szükséges a Resendben; vakon nem ismétlünk küldést.
A titkosított cron végpont: `/api/cron/newsletter` (Bearer `CRON_SECRET`).

A domain DNS-ében a Resend által megadott `resend._domainkey` TXT rekord és a
küldési CNAME rekordok szükségesek. A beállító szkript függőben lévő domainnél is
előkészíti a kapcsolatot, de a küldést kikapcsolva tartja. A korábbi, kifejezetten
hozzájárult címeket a külön listára átvezeti; szolgáltatói leiratkozást nem aktivál újra.

Ellenőrzések: `npm run test:newsletter`, valamint
`node --env-file=.env --conditions=react-server --experimental-strip-types scripts/verify-newsletter.mjs`.
Az utóbbi valódi Postgres-rekordokat használ, de a Resend-hívásokat kizárólag a
tesztben helyettesíti, levelet nem küld; a tesztadatokat a végén eltávolítja.

Valódi szolgáltatói próba:
`node --env-file=.env --conditions=react-server --experimental-strip-types scripts/verify-newsletter-provider.mjs --send-provider-tests`.
Ez kizárólag címkézett `delivered@resend.dev` tesztcímre küld, külön ideiglenes
listát használ, és eltávolítja a tesztfeliratkozót, listát és adatbázisrekordokat.
Az ingyenes csomag három listájából ehhez egy szabad hely szükséges.

## Adat- és verziómodell

Az adatbázis-migrációk a [`database`](./database) könyvtárban, az idempotens kezdő tartalom a [`data/seed-content.json`](./data/seed-content.json) fájlban található. A tanulmány új PDF-je új dokumentumverzió; a sikeres feldolgozás automatikusan véglegesíti az új hivatkozáslistát és a HTML olvasási nézetet.

Az egyszerű Biblia-olvasó és a versenkénti tanulmány-visszamutatás a következő fázis. A V1 már fordításfüggetlen OSIS-tartományokat tárol ehhez.
