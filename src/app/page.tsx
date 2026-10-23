import { Suspense } from "react";
import Image from "next/image";
import { HudBar } from "@/components/hud-bar";
import { Take, Note } from "@/components/take";
import { StabilizerDemo } from "@/components/stabilizer-demo";
import { FootageVideo, VideoToggle } from "@/components/footage-video";
import { Configurator, ConfiguratorFallback, FromPrice } from "@/components/configurator";
import { Compare } from "@/components/ui/compare";
import { Lens } from "@/components/ui/lens";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { kits, specs } from "@/lib/catalog";
import { formatPrice } from "@/lib/region";

import street from "@/assets/posters/street.jpg";
import pov from "@/assets/posters/pov.jpg";
import kyoto from "@/assets/footage/kyoto-dusk.jpg";
import kyotoPhone from "@/assets/footage/kyoto-dusk-phone.jpg";
import waterfront from "@/assets/footage/waterfront.jpg";
import friends from "@/assets/footage/friends.jpg";
import desert from "@/assets/footage/desert-road.jpg";
import venice from "@/assets/footage/venice.jpg";

const fromUsd = Math.min(...kits.map((k) => k.priceUsd));
const fromPrice = formatPrice(fromUsd, "USD");

const credits = [
  {
    role: "Server Components by default",
    detail: "Every section is server-rendered. Client code is limited to six small islands: timecode, stabilizer, compare, lens, captions and the reserve field.",
    file: "src/app/page.tsx",
  },
  {
    role: "Native fetch, cached",
    detail: "Exchange rates come from Next's fetch inside 'use cache' with cacheLife('hours') and a revalidation tag. No SWR, no React Query.",
    file: "src/lib/region.ts",
  },
  {
    role: "Forms as backend code",
    detail: "Reserving runs a Server Action that validates with zod on the server. useActionState carries the result back.",
    file: "src/app/actions.ts",
  },
  {
    role: "State in the URL",
    detail: "Finish and kit are search params, and every option is a prefetched <Link>. It's shareable, and it works with JavaScript off.",
    file: "src/components/configurator.tsx",
  },
  {
    role: "Suspense, not spinners",
    detail: "The configurator streams behind a Suspense fallback, and the route has loading.tsx. There's no isLoading state anywhere.",
    file: "src/app/loading.tsx",
  },
  {
    role: "proxy.ts at the request edge",
    detail: "The visitor's country is read before rendering and forwarded as a header, so the price is local with no client geolocation.",
    file: "src/proxy.ts",
  },
  {
    role: "Tailwind, no CSS-in-JS",
    detail: "Tailwind v4 with theme tokens in CSS. Nothing is injected at runtime and nothing extra is needed for SSR.",
    file: "src/app/globals.css",
  },
];

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <HudBar />
      <main>
        {/* ── Hero: the viewfinder ───────────────────────────── */}
        <Take
          id="top"
          label="GX1 introduction"
          clip="A001"
          timecode="00:04:12"
          scrim="hero"
          media={
            <FootageVideo
              id="hero-footage"
              poster={street}
              src="/video/street-1440.mp4"
              srcSmall="/video/street-720.mp4"
              alt="Three people walk away from the camera down a sunlit downtown sidewalk lined with brick buildings."
              priority
              className="push-in object-[62%_50%]"
            />
          }
        >
          <div className="pointer-events-none relative flex min-h-svh flex-col justify-center px-4 pt-28 pb-36 sm:px-8 lg:px-[8%] [&_a]:pointer-events-auto">
            <div className="focus-brackets w-fit px-6 py-7 sm:px-10 sm:py-9">
              <h1 className="font-display text-[clamp(3.75rem,9vw,6rem)] leading-[0.88] font-bold tracking-[-0.01em] uppercase">
                Walk.
                <br />
                It stays level.
              </h1>
            </div>
            {/* Level line: spans the whole frame at every width. It's the thesis. */}
            <div aria-hidden="true" className="relative -mx-4 mt-8 h-px bg-hud/75 sm:-mx-8 lg:-mx-[8%]">
              <span className="absolute -top-1.5 left-4 h-3.5 w-px bg-hud sm:left-8 lg:left-[8%]" />
              <span className="absolute -top-1.5 right-4 h-3.5 w-px bg-hud sm:right-8 lg:right-[8%]" />
              <span className="absolute -top-3 left-1/2 h-6 w-px -translate-x-1/2 bg-focus" />
              <span className="absolute top-2 right-4 font-mono text-[11px] tracking-wider text-hud sm:right-8 lg:right-[8%]">0.0°</span>
            </div>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-hud sm:text-xl">
              A camera on a three-axis gimbal, small enough for a jacket pocket. Hold it in one hand and walk. The footage stays steady.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href="#configure"
                className="group flex items-center gap-4 rounded-full py-1 pr-6 pl-1 font-display text-xl font-semibold tracking-[0.12em] uppercase transition-colors hover:bg-hud/10"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full border-[3px] border-hud transition-transform duration-300 ease-out-expo group-hover:scale-95">
                  <span className="h-11 w-11 rounded-full bg-rec transition-[border-radius,width,height] duration-300 ease-out-expo group-hover:h-7 group-hover:w-7 group-hover:rounded-md" />
                </span>
                Configure GX1
              </a>
              <p className="font-mono text-sm text-hud">
                From{" "}
                <Suspense fallback={<span>US{fromPrice}</span>}>
                  <FromPrice usd={fromUsd} />
                </Suspense>
              </p>
            </div>
          </div>

          <VideoToggle targetId="hero-footage" className="absolute right-4 bottom-14 sm:right-8" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-4 bottom-6 flex items-end gap-6 font-mono text-[11px] tracking-wider text-hud uppercase sm:right-8"
          >
            <span>1/120</span>
            <span>F2.0</span>
            <span>ISO 200</span>
            <span className="flex items-center gap-1.5">
              <span className="relative h-2.5 w-5 rounded-[2px] border border-hud">
                <span className="absolute inset-y-px left-px w-3 bg-hud" />
              </span>
              82%
            </span>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 left-4 hidden h-10 w-36 items-end gap-[3px] border-b border-hud/50 sm:left-8 sm:flex"
          >
            {[18, 30, 46, 70, 92, 74, 60, 68, 50, 34, 22, 12].map((h, i) => (
              <span key={i} className="flex-1 bg-focus/85" style={{ height: `${h}%` }} />
            ))}
          </div>

          <Note
            principle="Server Components by default"
            file="src/app/page.tsx · src/components/hud/timecode.tsx"
            className="absolute top-28 right-4 sm:right-8"
          >
            This whole frame is HTML from the server. The only JavaScript is the running timecode, a 30-line island.
          </Note>
        </Take>

        {/* ── Stabilization ──────────────────────────────────── */}
        <Take
          id="stabilize"
          label="Stabilization"
          clip="A002"
          timecode="00:07:40"
          scrim="none"
          media={
            <StabilizerDemo
              overlay={
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_0%_0%,rgb(11_11_11/0.78),rgb(11_11_11/0)_70%),linear-gradient(180deg,rgb(11_11_11/0)_70%,rgb(11_11_11/0.6)_100%)]"
                />
              }
            >
              <FootageVideo
                id="pov-footage"
                poster={pov}
                src="/video/pov-1080.mp4"
                // Phones crop the 16:9 frame to a narrow slice and the gyro mode
                // zooms up to ~2x, so they need the full 1080p file here.
                srcSmall="/video/pov-1080.mp4"
                alt="First-person view walking along a sunlit dirt path through a tall beech and pine forest."
              />
            </StabilizerDemo>
          }
        >
          <div className="pointer-events-none relative px-4 pt-28 sm:px-8 lg:px-[8%]">
            <h2 className="max-w-2xl font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.9] font-bold uppercase [text-shadow:0_2px_28px_rgb(0_0_0/0.55)]">
              Your hand shakes. The horizon doesn&apos;t.
            </h2>
            <p className="mt-5 max-w-md w-fit rounded-sm bg-ink/75 px-3 py-2 text-lg leading-relaxed text-hud backdrop-blur-sm">
              You&apos;re holding the camera: the frame follows your hand, wobble and all. Switch the stabilizer on and three motors take the shake out while you keep aiming.
            </p>
          </div>
          <VideoToggle targetId="pov-footage" className="absolute top-[4.25rem] right-4 sm:right-8" />
          <Note
            principle="Client only when necessary"
            file="src/components/stabilizer-demo.tsx"
            className="absolute top-28 right-4 sm:right-8"
          >
            One client island: pointer or phone tilt drives a spring-modeled hand, and a single requestAnimationFrame loop writes transforms straight to the DOM. It stops off screen and stays still under reduced motion.
          </Note>
        </Take>

        {/* ── Low light ─────────────────────────────────────── */}
        <Take
          id="sensor"
          label="Low-light sensor"
          clip="A003"
          timecode="00:11:02"
          scrim="none"
          media={
            <Compare
              className="h-full w-full"
              firstLabel="Phone (simulated)"
              secondLabel="GX1 (simulated)"
              first={
                <Image src={kyotoPhone} alt="The same Kyoto street at dusk, grainy and dim as a small phone sensor would record it." draggable={false} fill sizes="100vw" className="object-cover object-[50%_60%]" />
              }
              second={
                <Image src={kyoto} alt="A Kyoto street with a pagoda at dusk, clean and bright." placeholder="blur" draggable={false} fill sizes="100vw" className="object-cover object-[50%_60%]" />
              }
            />
          }
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_0%_0%,rgb(11_11_11/0.8),rgb(11_11_11/0)_70%)]" />
          <div className="pointer-events-none relative px-4 pt-28 sm:px-8 lg:px-[8%]">
            <h2 className="max-w-xl font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.9] font-bold uppercase [text-shadow:0_2px_28px_rgb(0_0_0/0.55)]">
              The hour after sunset still counts.
            </h2>
            <p className="mt-5 max-w-sm w-fit rounded-sm bg-ink/75 px-3 py-2 text-lg leading-relaxed text-hud backdrop-blur-sm">
              A 1-inch sensor collects about four times the light of a phone sensor. Drag across the frame to compare.
            </p>
          </div>
          <Note
            principle="Server images in a client island"
            file="src/components/ui/compare.tsx"
            className="absolute right-4 bottom-8 sm:right-8"
          >
            Both next/image elements render on the server and are passed into Aceternity&apos;s Compare as props. The island only owns the slider.
          </Note>
        </Take>

        {/* ── Punch-in ──────────────────────────────────────── */}
        <Take
          id="punch-in"
          label="4K punch-in"
          clip="A004"
          timecode="00:15:36"
          scrim="none"
          media={
            <Lens
              zoomFactor={2}
              lensSize={260}
              defaultPosition={{ x: 0.7, y: 0.52 }}
              zoomed={
                // Its own source at twice the width, so the 2x punch-in samples
                // the 5312px original rather than an upscaled screen-sized copy.
                <Image
                  src={waterfront}
                  alt=""
                  fill
                  quality={90}
                  sizes="200vw"
                  draggable={false}
                  className="object-cover object-[50%_60%]"
                />
              }
            >
              <Image
                src={waterfront}
                alt="Cape Town's harbor: sailboats and yachts moored below waterfront buildings, with Table Mountain behind."
                placeholder="blur"
                draggable={false}
                fill
                sizes="100vw"
                className="object-cover object-[50%_60%]"
              />
            </Lens>
          }
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_75%_at_0%_100%,rgb(11_11_11/0.9),rgb(11_11_11/0.55)_45%,rgb(11_11_11/0)_78%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-16 sm:px-8 lg:px-[8%]">
            <h2 className="max-w-xl font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.9] font-bold uppercase [text-shadow:0_2px_28px_rgb(0_0_0/0.55)]">
              Shoot wide. Find the close-up later.
            </h2>
            <p className="mt-5 max-w-sm w-fit rounded-sm bg-ink/75 px-3 py-2 text-lg leading-relaxed text-hud backdrop-blur-sm">
              4K leaves room to crop a sharp 1080p close-up after the fact, so one take gives you two shots. Move across the frame to punch in.
            </p>
          </div>
        </Take>

        {/* ── Captions ──────────────────────────────────────── */}
        <Take
          id="captions"
          label="Live captions"
          clip="A005"
          timecode="00:19:48"
          image={friends}
          alt="A group of friends sit with arms around each other, looking out at mountains and cable cars."
          scrim="top"
        >
          <div className="relative px-4 pt-28 sm:px-8 lg:px-[8%]">
            <h2 className="max-w-2xl font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.9] font-bold uppercase [text-shadow:0_2px_28px_rgb(0_0_0/0.55)]">
              Captions as you talk. On the camera.
            </h2>
            <p className="mt-5 max-w-md w-fit rounded-sm bg-ink/75 px-3 py-2 text-lg leading-relaxed text-hud backdrop-blur-sm">
              On-device speech to text puts subtitles in the preview and saves them as a separate file. No app and no upload.
            </p>
          </div>
          <div className="absolute inset-x-4 bottom-16 flex justify-center sm:bottom-20">
            <TextGenerateEffect
              className="max-w-3xl bg-ink/80 px-4 py-2 text-center text-[clamp(1.25rem,2.4vw,1.875rem)] leading-snug font-medium text-hud"
              lines={[
                "okay we made it up here, the light is unreal",
                "everybody look at the camera for a second",
                "and it's writing down everything we say",
              ]}
            />
          </div>
        </Take>

        {/* ── Specs: the camera's info menu ─────────────────── */}
        <Take
          id="specs"
          label="Specifications"
          clip="A006"
          timecode="00:23:10"
          image={desert}
          alt="A two-lane road running between red rock canyon walls."
          scrim="left"
        >
          <div className="relative grid min-h-svh gap-10 px-4 pt-32 pb-24 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:px-[8%]">
            <h2 className="font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.9] font-bold uppercase">
              Everything in 118 grams.
            </h2>
            <dl className="rounded-md bg-ink/80 px-5 py-2 backdrop-blur-md sm:px-7">
              {specs.map((s, i) => (
                <div
                  key={s.label}
                  className="flex items-baseline justify-between gap-6 border-b border-hud/15 py-4 last:border-b-0"
                >
                  <dt className="flex items-baseline gap-3 font-display text-lg font-semibold tracking-[0.14em] text-hud-dim uppercase">
                    <span
                      aria-hidden="true"
                      className={`h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent ${i === 0 ? "border-l-focus" : "border-l-transparent"}`}
                    />
                    {s.label}
                  </dt>
                  <dd className="tabular text-right font-mono text-sm text-hud sm:text-base">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Take>

        {/* ── Configure + reserve ───────────────────────────── */}
        <Take
          id="configure"
          label="Configure and reserve"
          clip="A007"
          timecode="00:26:54"
          image={venice}
          alt="The Rialto bridge over a Venice canal on a clear day."
          scrim="full"
          className="min-h-0"
        >
          <div className="relative px-4 pt-32 pb-24 sm:px-8 lg:px-[8%]">
            <h2 className="font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.9] font-bold uppercase">
              Configure yours.
            </h2>
            <div className="mt-10 rounded-md bg-ink/80 p-5 backdrop-blur-md sm:p-8 lg:p-12">
              <Suspense fallback={<ConfiguratorFallback />}>
                <Configurator searchParams={searchParams} />
              </Suspense>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <Note principle="Forms as backend code" file="src/app/actions.ts">
                A Server Action with zod validation. The form posts even before hydration.
              </Note>
              <Note principle="proxy.ts" file="src/proxy.ts">
                It reads the visitor&apos;s country before rendering, so the price above is local. Try ?region=JP.
              </Note>
              <Note principle="Native fetch + cache" file="src/lib/region.ts">
                Exchange rates use fetch in &apos;use cache&apos; with cacheLife(&apos;hours&apos;) and cacheTag(&apos;fx&apos;).
              </Note>
            </div>
          </div>
        </Take>

        {/* ── End credits ───────────────────────────────────── */}
        <section id="credits" aria-labelledby="credits-title" className="bg-ink px-4 pt-32 pb-16 sm:px-8 lg:px-[8%]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="credits-title" className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[0.95] font-bold uppercase">
              How this page is built
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-hud-dim">
              GX1 is fictional; the Next.js is real. Turn on Commentary at the top to see each technique where it&apos;s used.
            </p>
          </div>
          <dl className="mx-auto mt-16 max-w-3xl">
            {credits.map((c) => (
              <div
                key={c.role}
                className="grid gap-x-10 gap-y-2 border-t border-hud/15 py-7 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
              >
                <dt className="font-display text-xl font-semibold tracking-[0.1em] uppercase sm:text-right">
                  {c.role}
                </dt>
                <dd className="text-hud-dim">
                  {c.detail}
                  <span className="mt-2 block font-mono text-xs text-focus">{c.file}</span>
                </dd>
              </div>
            ))}
          </dl>

          <footer className="mx-auto mt-24 flex max-w-3xl flex-col items-center gap-3 border-t border-hud/15 pt-10 text-center text-sm text-hud-dim">
            <p className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-hud uppercase">
              <span className="h-2 w-2 bg-hud" aria-hidden="true" /> End of clip
            </p>
            <p className="max-w-lg">
              GX1, its specs and its prices are invented for a portfolio project. No camera will ship, and reservations are not stored. Footage stills are from Unsplash and are not GX1 output.
            </p>
          </footer>
        </section>
      </main>
    </>
  );
}
