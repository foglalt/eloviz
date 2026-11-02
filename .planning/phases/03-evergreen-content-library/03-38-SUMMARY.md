---
phase: 03
plan: 38
title: Apply droplet icon and align palette
status: complete
---

# Plan 03-38: Approved icon and palette alignment

- Shared decorative header/footer mark now renders the exact approved revised F
  artwork, exported as a 128px PNG at a reserved 40px size. No redrawing or colour
  substitution; clean rounded exports remove surrounding white canvas corners.
- Repeatable export script produces 16/32/48/128/180/192px assets. Self-contained
  SVG favicon embeds the compact artwork; new versioned SVG URL, PNG fallback
  and 180px Apple touch metadata prevent reuse of the old tree mark.
- Restrained palette: navy headings/hero veil/footer; gold hero eyebrow/CTA,
  Scripture and footer accents; soft aqua section wash. Current light paper,
  teal links, river artwork, typography, layout, content and interactions retained.
- No new client boundary/effects. Accessible named brand links retained, decorative
  image hidden with empty alt; dimensions reserved. Shared cached image is 20KB,
  32px favicon 1.9KB. No full-size draft image shipped as a runtime asset.
- Lint/build/strict TypeScript passed; actual local browser at 1440/390/320px,
  loaded header/footer, mobile-menu navigation and light Bible page checked.
  Exact HTTP bytes/metadata/dimensions and colour contrast passed.
- Commit 0c99fcc286d51351f5fa09ffc31c213711c94131 pushed; production
  dpl_BZXh5DfMq4frfcvieNgdW5wkmrvj READY with exact SHA and www alias.
  Live asset byte/dimension/metadata checks, rendered palette/logo and 390px fit
  passed; deployment error/fatal logs empty. No data/provider mutation.

## Large profile export (2026-11-02)

- User requested a larger PNG for the newsletter sender Google profile. The current favicon.svg embeds a128px raster and is not a vector master; exported from the original approved1254px f-full-orbits.png instead, without redrawing or upscaling.
- Saved assets/brand/living-water-profile-1024.png at1024×1024,881728bytes, using the existing high-quality rounded/transparent-corner export treatment. Actual file loaded and visually inspected: three gold stars/orbits and aqua droplet retained, sharp edges, transparent corners and opaque centre verified.
- No application, email template, sender account or DNS changes. User reports receiving is now configured; Google profile setup/actual recipient avatar verification is still an external unfinished task.
