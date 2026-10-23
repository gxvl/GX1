import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One "take": a full-bleed frame of footage with its clip slate in the HUD.
 * Server component; interactive pieces are passed in as children.
 */
export function Take({
  id,
  clip,
  timecode,
  image,
  alt,
  children,
  media,
  className,
  scrim = "bottom",
  label,
}: {
  id: string;
  clip: string;
  timecode: string;
  image?: StaticImageData;
  alt?: string;
  children: ReactNode;
  /** Replaces the default still, e.g. an interactive demo wrapping the image. */
  media?: ReactNode;
  className?: string;
  scrim?: "bottom" | "top" | "left" | "hero" | "full" | "none";
  label: string;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn("relative isolate min-h-svh scroll-mt-0 overflow-hidden bg-ink", className)}
    >
      <div className="absolute inset-0 -z-10">
        {media ??
          (image && (
            <Image
              src={image}
              alt={alt ?? ""}
              placeholder="blur"
              fill
              sizes="100vw"
              className="object-cover"
            />
          ))}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0",
            scrim === "bottom" && "bg-[linear-gradient(180deg,rgb(11_11_11/0.45)_0%,rgb(11_11_11/0)_28%,rgb(11_11_11/0)_45%,rgb(11_11_11/0.82)_100%)]",
            scrim === "top" && "bg-[linear-gradient(180deg,rgb(11_11_11/0.85)_0%,rgb(11_11_11/0.55)_32%,rgb(11_11_11/0)_58%,rgb(11_11_11/0.5)_100%)]",
            scrim === "left" && "bg-[linear-gradient(90deg,rgb(11_11_11/0.66)_0%,rgb(11_11_11/0.3)_38%,rgb(11_11_11/0)_58%),linear-gradient(180deg,rgb(11_11_11/0.4)_0%,rgb(11_11_11/0)_16%)]",
            scrim === "hero" && "bg-[linear-gradient(90deg,rgb(11_11_11/0.82)_0%,rgb(11_11_11/0.6)_32%,rgb(11_11_11/0.2)_52%,rgb(11_11_11/0)_66%),linear-gradient(180deg,rgb(11_11_11/0.45)_0%,rgb(11_11_11/0)_18%,rgb(11_11_11/0)_80%,rgb(11_11_11/0.4)_100%)] max-md:bg-[linear-gradient(180deg,rgb(11_11_11/0.6)_0%,rgb(11_11_11/0.55)_55%,rgb(11_11_11/0.25)_80%,rgb(11_11_11/0.5)_100%)]",
            scrim === "full" && "bg-ink/65",
          )}
        />
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none absolute top-20 left-4 z-10 rounded-sm bg-ink/65 px-2 py-1 font-mono text-[11px] tracking-[0.18em] text-hud-dim uppercase backdrop-blur-sm sm:left-8"
      >
        <span className="text-hud">{clip}</span> · <span className="tabular">{timecode}</span>
      </p>

      {children}
    </section>
  );
}

/** A director's-commentary note: hidden until the Commentary toggle is on. */
export function Note({
  principle,
  file,
  children,
  className,
}: {
  principle: string;
  file: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "commentary z-30 max-w-xs rounded-md border border-focus/80 bg-ink/90 p-4 text-sm leading-relaxed text-hud shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm",
        className,
      )}
    >
      <p className="font-display text-base font-semibold tracking-[0.12em] text-focus uppercase">
        {principle}
      </p>
      <p className="mt-1.5 text-hud-dim">{children}</p>
      <p className="mt-2 font-mono text-[11px] text-hud">{file}</p>
    </aside>
  );
}
