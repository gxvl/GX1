import Link from "next/link";
import { Timecode } from "@/components/hud/timecode";
import { CommentaryToggle } from "@/components/commentary-toggle";

const menu = [
  { href: "#stabilize", label: "Stabilize" },
  { href: "#sensor", label: "Sensor" },
  { href: "#punch-in", label: "Punch-in" },
  { href: "#captions", label: "Captions" },
  { href: "#specs", label: "Specs" },
];

/** The viewfinder's top line. Fixed, so the camera is always recording. */
export function HudBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[linear-gradient(180deg,rgb(11_11_11/0.6),rgb(11_11_11/0))] font-display text-[15px] font-semibold tracking-[0.12em] uppercase">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/" className="font-display text-xl font-bold tracking-[0.04em] normal-case">
            GX1
          </Link>
          <p className="flex items-center gap-2" aria-label="Recording">
            <span className="rec-blink h-2.5 w-2.5 rounded-full bg-rec" aria-hidden="true" />
            <span className="text-rec">Rec</span>
            <span className="text-sm">
              <Timecode startAt={252} />
            </span>
          </p>
        </div>

        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex gap-6 text-hud-dim">
            {menu.map((m) => (
              <li key={m.href}>
                <a href={m.href} className="transition-colors hover:text-hud">
                  {m.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-hud-dim md:inline">4K · 60</span>
          <CommentaryToggle />
          <a
            href="#configure"
            className="hidden rounded-full bg-hud px-4 py-1.5 text-ink transition-colors hover:bg-focus sm:block"
          >
            Configure
          </a>
        </div>
      </div>
    </header>
  );
}
