# React 19 + Next.js 16 Best Practices

**Date:** 2026-03-24  
**Purpose:** Capture official guidance that should shape implementation decisions in this repository.

## Confirmed Stack Versions

- `next`: `16.2.1` (`npm view next version`)
- `react`: `19.2.4` (`npm view react version`)
- `react-dom`: `19.2.4` (`npm view react-dom version`)

## Repo Rules Derived From Official Docs

1. **Use Server Components by default.**  
   Next.js App Router renders Server Components by default, which keeps client JavaScript smaller and fits content-heavy pages well. Only mark the smallest necessary boundary with `"use client"`.

2. **Use route groups and private folders for site-specific structure.**  
   Next.js documents route groups as a way to organize code without changing URLs, and private folders as safe places for non-routable feature files. This is a good fit for future subdomain-specific surfaces.

3. **Fetch on the server first.**  
   Next.js recommends fetching in async Server Components. When routes benefit from partial rendering, use `loading.tsx` or local `<Suspense>` boundaries rather than pushing everything to the client.

4. **Treat components as pure render functions.**  
   React assumes components are pure. In this repo that means page content, timeline rendering, and site-config-driven UI should be derived directly from props and data, not from render-phase mutation.

5. **Avoid unnecessary Effects.**  
   React recommends not using Effects when values can be derived during render or handled directly in event handlers. Static content pages should stay Effect-free unless there is a real external synchronization need.

6. **Use `useEffectEvent` for non-reactive logic inside Effects.**  
   When an Effect truly must exist but needs the latest props/state without retriggering subscriptions, `useEffectEvent` is the preferred React 19 pattern.

7. **Prefer Actions for future forms and quiz submission flows.**  
   React 19's `useActionState` is the documented path for stateful actions with side effects. That should be the default starting point for the future quiz flow instead of custom loading/error state wiring.

8. **Use static metadata and `next/font`.**  
   Next.js recommends the `metadata` export for titles, descriptions, and Open Graph data, and `next/font` for optimized font loading. This repo should use both consistently.

## Practical Application To This Repo

- Keep `src/app/` focused on routing, layouts, metadata, and route-scoped private folders.
- Keep public-facing text fully Hungarian.
- Keep landing pages server-rendered unless a concrete interactive need exists.
- Model subdomain content as data, not hardcoded JSX spread across the app.
- Introduce client hooks only when the page behavior actually requires them.

## Official Sources

- React component purity: <https://react.dev/learn/keeping-components-pure>
- React unnecessary Effects guidance: <https://react.dev/learn/you-might-not-need-an-effect>
- React `useEffectEvent`: <https://react.dev/reference/react/useEffectEvent>
- React `useActionState`: <https://react.dev/reference/react/useActionState>
- Next.js project structure: <https://nextjs.org/docs/app/getting-started/project-structure>
- Next.js server and client components: <https://nextjs.org/docs/app/getting-started/server-and-client-components>
- Next.js data fetching: <https://nextjs.org/docs/app/getting-started/fetching-data>
- Next.js fonts: <https://nextjs.org/docs/app/getting-started/fonts>
- Next.js metadata: <https://nextjs.org/docs/app/getting-started/metadata-and-og-images>
