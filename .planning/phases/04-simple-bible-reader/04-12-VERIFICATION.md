# 04-12 Verification

2026-10-15. Public layout/discovery and subscription scroll isolation.

## Local evidence

- PASS107automated tests, zero failures. New search test excludes empty/video-only
  matching topics; existing series tests exclude drafts and missing published PDFs.
- PASS actual series repository loaded with isolated query fixtures: only the
  readable series appears in discovery; empty, draft-only and missing-PDF series
  retain direct lookups; admin draft parts remain intact. Actual page component
  renders an empty published series safely without an undefined/start chapter
  link. Production currently has one nonempty series, so empty-series rendering
  used fixtures rather than publishing test records.
- PASS read-only SQL:32published topics,5with readable studies; video-only
  csalad-es-hazassag has0studies/1video. No schema/editorial-data writes.
- PASS11local HTTP200 routes: home/topics/series/video, empty topic/direct Other,
  video-only topic, topic searches and sitemap. Discovery contains5topics;
  empty/video-only/Other links excluded, positive Bible-topic search retained;
  direct video-only topic still contains its video.
- PASS real browser1280x720: topic top padding115.2->48px, H1 83.2->51.2px,
  first row456.9->312px. Featured section277px, no reference list, title at top.
  Topics, studies, series/detail, study/detail, videos, Bible and search reviewed.
- PASS820/390/320responsive catalogues, series/detail and Bible: no horizontal
  overflow. Phone series chapter starts380px at390wide, ahead of full intro;
  saved newlines remain pre-line. Featured section343px at320wide, title first.
- PASS study Bible regression: sticky reader top96/bottom704 in720viewport,
  close restores regular topics/references. No horizontal overflow.
- PASS fresh-visitor subscription modal: body fixed/root overflow hidden; wheel
  over backdrop leaves pageY0. At390x600, inner contents scroll92px while page
  stays0. Escape restores styles; page then scrolls600px. Close button separately
  restores exact empty inline styles at320wide. No emails submitted.
- PASS browser console errors empty; local test viewport reset and dev server
  stopped. Alternate local hosts used only to obtain fresh notice storage;
  development-only HMR/font origin warnings were not production failures.
- PASS final GTD04 report2026-10-15T13:59:41+02:00: full lint/build exit0,
  production compilation and strict TypeScript. Standalone tsc also passed.
  Initial build caught a nullable captured dialog in a function declaration;
  changed to a narrowed arrow callback and reran all checks successfully.
- React review: server rendering retained for catalogues; the existing small
  client modal boundary owns its effect cleanup. No new dependencies or schema.

## Release

- PASS d11c5ee80fc19d3f506d5a571ec325fa2ae6f414 pushed to origin/main;
  dpl_J98uKM4oBb4neYS4u2Qcu1vNQxgi READY for exact code SHA, production target,
  www.eloviz.hu and eloviz-phi.vercel.app aliases verified.
- PASS all11HTTP checks repeated against www.eloviz.hu: only5topics discoverable,
  empty/video-only direct pages200, positive search works, empty topic search and
  sitemap exclusion correct; direct video-only topic still has its video.
- PASS canonical live browser:48px top gap, first topic row312px, no horizontal
  overflow;277px featured section, title at top and no verse list. Series desktop
  contents/introduction alignment visually reviewed. Browser errors empty.
- PASS fresh-visitor live production alias eloviz-phi.vercel.app: root hidden,
  body fixed; at390x600inner modal scrolls92px while background staysY0. Escape
  restores exact styles; normal page scrolling resumes. No signup/email submitted.
  Production-mode local build also passed the later-dismissal button branch.
- Screenshots saved/reviewed: output/compact-feature-live.png,
  output/compact-series-live.png, output/compact-topics-live.png. Test viewport
  reset. No CDP state changes, test publications or schema changes.
- Deployment-scoped error/fatal runtime log scan: no matching logs. Memory health
  and whitespace checks passed. Source/current document content remains intact.
