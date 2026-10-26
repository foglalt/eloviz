# 04-17 Verification

- Exact source: doc cc8c0241-b405-4aaa-a313-f6d37ac5c239,161335bytes,SHA256 9b7ca7fecce406f300bcf336ef3c9b4771eb940634fd5cea42735c97a7dd2fcb. Original retained in ignored tmp/pdfs/history-scenes-chapter4.pdf.
- PyMuPDF page5/page6 renders inspected. Final answer3 has no punctuation at page5 end; question7 begins page6 separately.
- All132 Node tests pass (tmp/tests-04-17.log). Four new article regressions cover the reported boundary and numbering.
- scripts/gtd.ps1 verify -Phase04: lint0/build0, report04-VERIFICATION.md. tsc --noEmit passed.
- Actual-source dry-run --article-only --expect-no-quotes:44blocks, final list starts6;1;7 with lengths1;3;1;41candidates/35merged references, no quoted blocks. Extracted plain text exactly unchanged. Original source and emphasis retained.
- Release and live browser evidence pending.
