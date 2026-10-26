# 04-17 Verification

- Exact source: doc cc8c0241-b405-4aaa-a313-f6d37ac5c239,161335bytes,SHA256 9b7ca7fecce406f300bcf336ef3c9b4771eb940634fd5cea42735c97a7dd2fcb. Original retained in ignored tmp/pdfs/history-scenes-chapter4.pdf.
- PyMuPDF page5/page6 renders inspected. Final answer3 has no punctuation at page5 end; question7 begins page6 separately.
- All132 Node tests pass (tmp/tests-04-17.log). Four new article regressions cover the reported boundary and numbering.
- scripts/gtd.ps1 verify -Phase04: lint0/build0, report04-VERIFICATION.md. tsc --noEmit passed.
- Actual-source dry-run --article-only --expect-no-quotes:44blocks, final list starts6;1;7 with lengths1;3;1;41candidates/35merged references, no quoted blocks. Extracted plain text exactly unchanged. Original source and emphasis retained.
- Release: f0e4733043c4d7ab5e90b7c4d3339ba6d1a1db8e / dpl_2n9THJhmgPwEwkTNJoTZdRopR6jJ READY, production aliases verified through Vercel connector.
- Guarded --apply --article-only succeeded. Recovery snapshot tmp/backups/study-cc8c0241-b405-4aaa-a313-f6d37ac5c239-1793021892242.json. Exact readback passed; reference candidates/final references, extracted text, document pointer, hash and publication timestamps preserved.
- Live HTTPS200 parsed HTML (tmp/verify-study-ending-live.py; response tmp/study-ending-live.html): all44blocks match source-derived text; end lists start6;1;7 and contain1;3;1items. Exactly three answers are hidden; last hidden answer contains only Az örök életet. Question7 is visible outside spoilers and retains bold words/Bible link. Original PDF delivery hash passed.
- Vercel error/fatal logs since15m: none.
- Visual/interactive browser review unavailable: CUA attempts for both iab and Opera returned Local browser use is disabled in Work settings. No tabs opened, modified or closed. No screenshot or responsive/interactive pass claimed; HTML structure verified as above.
