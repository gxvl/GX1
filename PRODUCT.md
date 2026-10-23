# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (React, App Router), chosen by the user, deployed on **Vercel**. Visual effects come mostly from Aceternity UI (https://ui.aceternity.com), which builds on Tailwind CSS and Motion (Framer Motion).

### Next.js principles the codebase must demonstrate

These are binding. The code is part of the showcase, and a reviewer reading the repo should see each one in practice. The motto is **server-first, client only when necessary.**

1. **Native `fetch`.** Fetch data with Next's extended `fetch()` on the server, using its built-in caching and revalidation. No hand-rolled client fetching.
2. **Forms as backend code.** Use Server Actions for forms, with schema validation on the server (zod). This covers about 90% of cases.
3. **No SWR or React Query by reflex.** Rely on Next's cache and its native revalidation (`revalidatePath`, `revalidateTag`, time-based revalidation).
4. **Server Components by default.** `"use client"` only at the leaves that truly need interactivity. Aceternity effects are client islands wrapped by server-rendered content. Less JS on the client means a smaller bundle, better TTI and better real-world performance.
5. **No spinner state.** Use route-level `loading.tsx` and `<Suspense>` boundaries with streaming, not `isLoading` useState.
6. **No styled-components or CSS-in-JS runtimes.** Use Tailwind CSS.
7. **`proxy.ts` before rendering.** Handle redirects, geolocation and similar pre-render concerns in `proxy.ts` (the Next 16 successor to `middleware.ts`), with no client JS cost. Note: in Next 16, Proxy runs on the Node.js runtime by default, not the edge runtime.

Where a principle has no natural use on the landing page, demonstrate it honestly with a real need. For example, a waitlist or pre-order form uses a Server Action and zod, and geolocation in `proxy.ts` sets the regional availability shown on the page. Don't add features that exist only to tick a box and do nothing.

## Users

There are two audiences, and they must not be confused:

- **The real audience: hiring managers and recruiters** who are judging the builder's frontend and Next.js skill. They are usually skimming a portfolio link between other tasks, often on a laptop and sometimes on a phone, and they decide within seconds whether the work looks senior.
- **The in-fiction audience: prospective buyers of GX1**, a premium hardware device. They are the people the site's copy speaks to. They exist only to make the showcase believable.

## Product Purpose

GX1 is a portfolio showcase presented as a launch site for a fictional premium hardware product. Its real job is to show, convincingly, that the builder can:

- design and ship a polished marketing experience;
- use Next.js well (App Router, server components, routing, image and font optimization, metadata, performance);
- integrate high-impact visual effects, mostly Aceternity UI, with taste and restraint rather than piling them up.

It succeeds when a reviewer comes away thinking "this person ships production-grade, beautiful frontend work." Signals of that include smooth performance, responsive layouts, accessibility, clean architecture, and effects that serve the story.

## Positioning

The site is not a component demo dump. Every effect sits inside one coherent, believable product story, and that is what separates GX1 from the usual "I tried Aceternity" gallery. The story is the frame, and the craft is the evidence.

## Operating Context

- Reviewers open it from a résumé, LinkedIn, or GitHub link, possibly with the source repo open next to it, so code quality and structure are part of the product.
- First impressions come from the first viewport and the first scroll, on both desktop and mobile.
- Reviewers may test it on modest hardware or a throttled connection, so heavy effects must not make the experience janky.

## Capabilities and Constraints

- GX1 is fictional. Everything about it is invented on purpose and must read as clearly fictional to anyone who looks closely. It must never imitate a real brand, product, or company.
- **GX1 is a pocket gimbal vlog camera**: a camera head on a three-axis mechanical gimbal over a one-hand grip, for creators who film while walking. Its invented specs and prices live in `src/lib/catalog.ts`, which is the single source for them.
- The visitor action on the landing page is **pre-order with a configurator** (finish + kit, then reserve with an email). Reservations are simulated: validated on the server, never stored or charged.
- The **launch landing page** comes first. Other pages are not decided yet.
- Aceternity UI is the main effects source. Other libraries are allowed when they serve the work better.

## Brand Commitments

- The product name is **GX1**.
- No other brand commitments yet: no logo, voice guide, or assets exist.

## Evidence on Hand

None. The project directory is empty. There are no real product photos, renders, reviews, press, or customers. Imagery must be generated or built for this project. Do not fabricate testimonials, press quotes, or awards presented as real. Any social proof in the fiction must stay obviously fictional.

## Product Principles

1. **Craft is the claim.** The site is the portfolio. Every interaction, transition, and line of code is evidence a reviewer may inspect.
2. **Story over sampler.** Pick effects for what they do for GX1's narrative, never just to fit in another component.
3. **Fast enough to feel premium.** Performance and smoothness count as visual quality. Jank undoes any effect.
4. **Believable, never deceptive.** The fiction should be convincing in quality, but never imitate a real company or present invented proof as fact.
5. **Senior signals in the details.** Responsive behavior, reduced-motion support, keyboard access, and metadata are what mark the work as professional rather than a demo.

## Accessibility & Inclusion

Aim for WCAG 2.2 AA. Every motion-heavy effect must respect `prefers-reduced-motion` and fall back to a static version. This is both an inclusion need and a seniority signal for the reviewer audience.
