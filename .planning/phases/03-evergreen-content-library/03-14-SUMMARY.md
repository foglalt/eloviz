---
phase: 03
plan: 14
status: completed
completed: 2026-07-28
---

# 03-14 Summary: Consistent public preview sizing and metadata

- Limited public resource-list and search-result descriptions to a reserved three-line block with CSS line clamping and ellipsis.
- Removed YouTube channel names from video-list and search-result metadata while retaining speaker metadata.
- Preserved channel-name search matching, the channel on the selected video detail page, and all admin channel fields.
- Added regression coverage proving channel searches still return the video without exposing the channel as preview metadata.

## Verification

- All eight catalogue-search tests passed.
- ESLint, strict TypeScript, and the Next.js production build passed.
- Browser checks confirmed resource and search descriptions use a three-line clamp, with a long mobile preview truncated from four lines to three.
- Desktop and 390 px layouts had no horizontal overflow.
- A channel-name query still returned the matching video without a channel metadata line.
- The selected video detail page still displayed its channel.
- The browser console contained no errors.
- Production deployment `dpl_HfVCERfTUa7LFtDabf4cQqvAYG2d` reached READY.
- Live `www.eloviz.hu` checks confirmed the three-line clamp is shipped, video listings and search results omit channel metadata, channel-name search still returns the video, and the selected video page retains the full channel.

---
*Completed: 2026-07-28*
