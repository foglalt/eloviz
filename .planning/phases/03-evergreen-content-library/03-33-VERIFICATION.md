# Ordered Study Series Verification — 2026-10-13

Story: an editor creates a series, attaches or creates chapter studies, orders
and publishes readable parts; readers select a chapter and navigate in order.

| Check | Result | Evidence |
|---|---|---|
| Automated regressions | PASS | 64 tests, zero failures/skips; six new series tests |
| Additive migration | PASS | `008_study_series` applied; prior migrations skipped |
| Database probes | PASS | Insertion, reorder, move/remove/clamp, rollback, ownership conflict rollback, concurrent writes and exact timestamp revision guards |
| Lint/build/TypeScript | PASS | GTD `03-VERIFICATION.md` |
| Authentication | PASS | Anonymous series editor redirects to login |
| Create series | PASS | Actual form saved title, author/source/description and exposed add-next shortcut |
| Reorder/remove/reattach | PASS | Arrows saved; removed fixture became attachable; reattachment saved |
| Create next chapter | PASS | Series/position/topics prefilled, draft saved and PDF upload step visible |
| Move/standalone | PASS | Actual study form moved fixture to another series and back to standalone, preserving the study |
| Repeated confirmation | PASS | Consecutive saves with identical messages both opened and dismissed confirmation |
| Public boundaries | PASS | Drafts/missing PDFs omitted; draft/empty series and private chapter return 404 |
| Reader navigation | PASS | Current marker, previous/next clicks, draft skipping and first/last boundaries |
| SEO | PASS | Chapter/series canonicals, CreativeWorkSeries/ItemList, Article.isPartOf and filtered sitemap |
| Responsive/accessibility | PASS | Admin 1440/390 px; public 1440/390/320 px; no overflow; labelled native 44 px ordering controls |
| Browser runtime | PASS | Public console: zero errors/warnings |
| Cleanup | PASS | Generated fixture IDs and known created chapters/series removed; original PDF/Blob objects untouched |

Interaction tests repaired Neon Date/microsecond revision conversion and the
existing same-message confirmation behavior. New study/series workspaces key
confirmations to saved record revisions.

Screenshots are in ignored `output/playwright/` and were visually inspected.
Temporary local credentials were used; no production credentials/subscriber data
were read. SUMtv reference: https://sumtv.org/study-notes (2026-10-13).

## Production

- Source commit: `de50aab2bb465b394c42514f22f47f28969f276d`, pushed to `main`.
- Vercel project/team matched `.vercel/project.json`; connected production
  deployment `dpl_DRzEst1fqvPYtV5xG1KpXmDLgNhS` reached READY with this exact SHA
  and the `www.eloviz.hu` alias, without alias errors.
- Live `/`, `/sorozatok`, `/tanulmanyok` and `/sitemap.xml`: HTTP 200; signup
  notice, series discovery link and sitemap index entry present; fixtures absent.
- `/admin/sorozatok` and `/admin/feliratkozok` redirect anonymous users to login.
- Removed test-series detail returns HTTP 404; own fixture-ID cleanup query
  confirms zero remaining browser-created studies/series.
- Existing public document `8d15afcc-2456-40da-b1c8-224adcd9f86c`: HTTP 200,
  application/pdf, 75,525 bytes and unchanged SHA-256
  `7479188792bc75b8bdcc02d93a48a9034594e67b51075ea4bfe2bd6005bc3f4f`.
- Deployment-scoped production error/fatal log scan: no matching entries.
- Authenticated editing was verified locally with temporary credentials;
  production was checked through read-only public/anonymous requests.
