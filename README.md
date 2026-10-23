# GX1

A launch page for **GX1**, a fictional pocket gimbal camera, built as a Next.js portfolio piece. The product is invented, but the engineering is real.

The whole page works as the camera's live viewfinder: daylight footage, a thin HUD, REC red and focus yellow. Turn on **Commentary** in the top bar to see which Next.js technique each section uses.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Add `?region=JP` (or `BR`, `GB`, `DE`…) to the URL to preview local pricing. On Vercel, the country comes from the request automatically.

## What it demonstrates

| Principle | Where |
|---|---|
| Server Components by default. Six small client islands: timecode, stabilizer, compare, lens, captions and the reserve field | `src/app/page.tsx` |
| Native `fetch` inside `'use cache'` with `cacheLife('hours')` and `cacheTag('fx')`, and no SWR or React Query | `src/lib/region.ts` |
| Forms as backend code: a Server Action with zod, plus `useActionState` | `src/app/actions.ts`, `src/components/reserve-form.tsx` |
| Configurator state in the URL: prefetched `<Link>`s that work with JS off | `src/components/configurator.tsx` |
| Streaming with `<Suspense>` and `loading.tsx`, with no spinner state | `src/app/page.tsx`, `src/app/loading.tsx` |
| `proxy.ts` forwards the visitor's country before rendering | `src/proxy.ts` |
| Tailwind v4 tokens with no CSS-in-JS runtime | `src/app/globals.css` |
| Cache Components and Partial Prerendering: a static shell with the configurator streamed in | `next.config.ts` |

Visual effects are adapted from [Aceternity UI](https://ui.aceternity.com) (Compare, Lens, Placeholders and Vanish Input, Text Generate Effect) and restyled to fit the viewfinder. Every motion effect respects `prefers-reduced-motion`.

## Credits

Footage stills are from [Unsplash](https://unsplash.com). See `docs/footage-sources.md` for each photo. They stand in for GX1 footage and are not real output. GX1's specs and prices are fictional.
