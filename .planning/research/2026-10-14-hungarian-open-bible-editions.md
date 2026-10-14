# Additional Hungarian Bible editions: reuse shortlist

Checked2026-10-14. Research only; no new translation ingested or published.
User first clarified the reader control; correction04-05 was released and verified
before completing this shortlist. Permission for online reading is distinguished
from permission to redistribute an entire translation.

## Best candidates

| Edition | Coverage | Published reuse declaration | Digital availability / readiness |
|---|---|---|---|
| Biblica Nyitott Újszövetség: élet, igazság és világosság | New Testament | CC BY-SA4.0 | eBible offers USFM, USFX, VPL/SQL and HTML. Best modern candidate; source completeness/checksum/numbering audit still required. |
| Káldi, Tárkányi revision1865 | Catholic full Bible | Szentírás states the text is not protected | Readable digital text inspected at Kapisztrán; source has headings, notes and cross-references to separate from verses. |
| Masznyik Endre1925 | New Testament | Digital provider explicitly states public domain | All27book links listed. Bulk source and transcription audit still required. |
| Raffay Sándor1929 | New Testament | Digital provider explicitly states public domain | All27book links listed; digitizer attribution recorded by provider. Bulk source audit still required. |
| Pre-revision Károli | Full Bible | Provider states public domain | Historical comparison candidate, distinct from our revised1908. Source audit needed. |
| Vizsolyi1590 | Full historical translation | Provider states public domain | Online transcription labelled BÉTA; completeness and digital-source terms need review. Lower priority. |

## Source evidence

- [eBible/Biblica licence and formats](https://ebible.org/bible/details.php?id=hun):
  explicitly New Testament, copyright2003/2021, CC BY-SA4.0. Preserve copyright,
  source and licence information; changes must be identified and adapted text
  shared under that licence. Preserve Biblica trademark notices on unmodified
  copies; the source gives different trademark rules for modified works. Do not
  imply publisher endorsement. This is not the EFO/ERV-HU translation.
- [Creative Commons BY-SA4.0](https://creativecommons.org/licenses/by-sa/4.0/):
  redistribution and adaptation are permitted with attribution and share-alike
  requirements. Keep edition-specific licence notices alongside the text.
- [Szentírás translation register](https://szentiras.eu/forditasok): explicitly
  identifies Káldi's1865Tárkányi revision as unprotected, distinct from licensed
  modern Káldi-Neovulgáta. It lists RUF2014 under temporary publisher permission;
  the site's CC licence for its own commentary does not open every translation.
- [Káldi digitization](https://biblia.kapisztran.info/): built-in browser confirmed
  readable Genesis verse text and Old/New Testament contents including Catholic
  additional books. Szentírás's linked legacy GitLab site redirects here. This is
  availability evidence, not a separate blanket licence for site design/notes.
- [Digital Bible Society original Káldi register](https://arc.dbs.org/data/scripture/HUNKLD/):
  identifies1626 original, full Bible with deuterocanon and Public Domain. Do not
  label the1865revision as an exact1626 transcription.
- [Masznyik digital register](https://www.okosbiblia.hu/bible/me1925) and
  [Raffay digital register](https://www.okosbiblia.hu/bible/rs1929): each names the
  edition, lists27New Testament books and explicitly declares public domain.
- [Historical Károli/Vizsolyi register](https://www.okosbiblia.hu/bible-translations)
  gives the public-domain declarations and flags the Vizsolyi transcription beta.

## Editions not cleared for republication

- RUF2014, modern Káldi-Neovulgáta, Szent István and Békés-Dalos: the Szentírás
  register records publisher permissions, not a general open redistribution grant.
- [EFO/ERV-HU publisher record](https://www.biblegateway.com/versions/Hungarian-Bible-Easy-to-Read-Version-ERV-HU/)
  names Bible League/WBTC and copyright2003/2012. No public licence identified in
  this audit; obtain a full-text website-use grant before importing.
- Kecskeméthy's currently hosted full edition: [provider terms](https://www.okosbiblia.hu/hasznalati-feltetelek)
  describe Koinónia's site-specific permission. Translator age alone does not
  clear that modern published dataset. Leave outside the cleared shortlist.

## Recommendation and next implementation boundary

My recommendation is Biblica's open NT first, offering another modern wording;
Masznyik/Raffay add historical Protestant comparison. Káldi1865 is an alternative
complete historical Catholic edition; its canon and numbering need explicit
handling. No additional modern full Hungarian Bible was verified as openly
licensed in this audit; this is a search result, not a claim none exists.

Before ingestion: select exact editions, obtain a permitted bulk source, archive
its licence and checksums, verify every book/chapter/verse and omissions, preserve
wording, and audit numbering against our canonical study-reference scheme. Add
translation-aware navigation/metadata with existing1908URLs intact; do not silently
mix NT-only coverage with a different Old Testament under one edition label.
