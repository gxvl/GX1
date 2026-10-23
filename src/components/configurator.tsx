import Link from "next/link";
import { headers } from "next/headers";
import { finishes, getFinish, getKit, kits } from "@/lib/catalog";
import { COUNTRY_HEADER, formatPrice, getUsdRates, resolveRegion } from "@/lib/region";
import { GX1Device } from "@/components/gx1-device";
import { ReserveForm } from "@/components/reserve-form";
import { cn } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Server-rendered configurator. Selection lives in the URL (?finish=&kit=), so
 * every option is a plain <Link>: shareable, works without JS, and prefetched.
 * Region comes from the header proxy.ts sets; the price uses cached FX rates.
 */
export async function Configurator({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const finish = getFinish(params.finish);
  const kit = getKit(params.kit);
  const region = resolveRegion((await headers()).get(COUNTRY_HEADER));
  const regionOverride = typeof params.region === "string" ? params.region : undefined;

  const rates = await getUsdRates();
  const rate = region.currency === "USD" ? 1 : rates?.rates[region.currency];
  const currency = rate ? region.currency : "USD";
  const price = (usd: number) => formatPrice(usd * (rate ?? 1), currency);

  const href = (next: { finish?: string; kit?: string }) => ({
    query: {
      finish: next.finish ?? finish.id,
      kit: next.kit ?? kit.id,
      ...(regionOverride ? { region: regionOverride } : {}),
    },
  });

  const specLine = `GX1-01 / ${finish.name} / ${kit.name}`.toUpperCase();

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
      {/* Preview: the device in the chosen finish, framed like a focus target. */}
      <div className="relative flex min-h-[420px] items-center justify-center lg:min-h-[560px]">
        <div className="focus-brackets focus-brackets-white absolute inset-6 opacity-60 [--l:22px]" aria-hidden="true" />
        <GX1Device
          key={finish.id}
          finish={finish}
          className="relative h-[380px] w-auto drop-shadow-[0_24px_32px_rgba(0,0,0,0.45)] motion-safe:animate-[device-in_600ms_cubic-bezier(0.16,1,0.3,1)] lg:h-[500px]"
        />
        <p className="absolute bottom-0 left-6 font-mono text-[11px] tracking-wider text-hud-dim uppercase">
          {specLine}
        </p>
      </div>

      <div className="flex flex-col gap-9">
        <fieldset>
          <legend className="font-display text-sm font-semibold tracking-[0.2em] text-hud-dim uppercase">
            Finish · <span className="text-hud">{finish.name}</span>
          </legend>
          <div className="mt-4 flex gap-4">
            {finishes.map((f) => {
              const active = f.id === finish.id;
              return (
                <Link
                  key={f.id}
                  href={href({ finish: f.id })}
                  scroll={false}
                  prefetch
                  replace
                  aria-current={active ? "true" : undefined}
                  aria-label={`${f.name} finish`}
                  className={cn(
                    "group relative grid h-16 w-16 place-items-center rounded-full border-2 transition-[border-color,transform] duration-300 ease-out-expo hover:-translate-y-0.5",
                    active ? "border-focus" : "border-hud/25 hover:border-hud/60",
                  )}
                >
                  <span
                    className="h-11 w-11 rounded-full shadow-[inset_0_-6px_10px_rgba(0,0,0,0.25)]"
                    style={{ background: `linear-gradient(135deg, ${f.light}, ${f.body} 45%, ${f.shade})` }}
                  />
                </Link>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-sm font-semibold tracking-[0.2em] text-hud-dim uppercase">
            Kit
          </legend>
          <ul className="mt-3 divide-y divide-hud/15 border-y border-hud/15">
            {kits.map((k) => {
              const active = k.id === kit.id;
              return (
                <li key={k.id}>
                  <Link
                    href={href({ kit: k.id })}
                    scroll={false}
                    prefetch
                    replace
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "grid grid-cols-[1.25rem_1fr_auto] items-baseline gap-x-3 py-4 transition-colors duration-200",
                      active ? "text-hud" : "text-hud-dim hover:text-hud",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-3 w-3 translate-y-[-1px] rounded-full border",
                        active ? "border-focus bg-focus" : "border-hud/50",
                      )}
                    />
                    <span>
                      <span className="font-display text-2xl font-semibold tracking-wide uppercase">
                        {k.name}
                      </span>
                      <span className="mt-1 block text-sm text-hud-dim">{k.contents.join(" · ")}</span>
                    </span>
                    <span className="tabular font-mono text-sm">{price(k.priceUsd)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="font-display text-5xl font-bold tracking-tight uppercase tabular">
              {price(kit.priceUsd)}
            </p>
            <p className="text-sm text-hud-dim">
              Ships to {region.countryName} in spring 2027
              {currency !== "USD" && rates ? " · converted from USD daily" : ""}
            </p>
          </div>
          <div className="mt-5">
            <ReserveForm finish={finish.id} kit={kit.id} country={region.country} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Streams in the static shell while the request-time configurator renders. No spinner. */
export function ConfiguratorFallback() {
  return (
    <div className="grid min-h-[560px] place-items-center" aria-busy="true">
      <div className="focus-brackets relative grid h-40 w-64 place-items-center">
        <p className="font-mono text-xs tracking-[0.2em] text-focus uppercase">
          <span className="rec-blink">Metering</span> · local price
        </p>
      </div>
    </div>
  );
}

/** The hero's from-price, localized through the same region + FX path as the configurator. */
export async function FromPrice({ usd }: { usd: number }) {
  const region = resolveRegion((await headers()).get(COUNTRY_HEADER));
  const rates = await getUsdRates();
  const rate = region.currency === "USD" ? 1 : rates?.rates[region.currency];
  return <span>{formatPrice(usd * (rate ?? 1), rate ? region.currency : "USD")}</span>;
}
