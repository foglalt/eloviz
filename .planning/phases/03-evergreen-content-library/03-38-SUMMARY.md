---
phase: 03
plan: 38
title: Apply droplet icon and align palette
status: implemented
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
- Production rollout pending; no database/provider/subscriber mutation.
