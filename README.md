# Élő Víz - Next.js 16 Project

Hungarian-language Easter microsite built with Next.js 16 App Router and React 19.

## Tech Stack

- Next.js `16.2.1` (App Router)
- React `19.2.x`
- TypeScript (strict mode)
- ESLint 9 + `eslint-config-next`
- Optional Neon Postgres via `@neondatabase/serverless`

## Main Features

- Public Easter landing page (`/`)
- One-question-at-a-time Easter quiz (`/kviz`)
- Study topics with printable export (`/studies`)
- Admin editor for quiz content (`/admin`)
- Optional contact capture and device analytics persisted to Neon

## Environment Variables

Create a local `.env.local` file with:

```env
# Required to use /admin login
ADMIN_PASSWORD=your-secure-password

# Optional: enables persistent storage in Neon
DATABASE_URL=postgresql://...
```

Behavior without `DATABASE_URL`:

- Quiz content falls back to built-in defaults.
- Contact requests and quiz analytics cannot be stored.
- Admin still works for editing, but saving to DB is disabled.

## Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Run linter:

```bash
npm run lint
```

## Project Notes

- Public-facing copy is intentionally Hungarian by default.
- Styling uses warm parchment/clay tokens defined in `src/app/globals.css`.
- Easter-specific routes are grouped under `src/app/(husvet)`.
- `next-env.d.ts` is Next-generated; do not manually edit it.
