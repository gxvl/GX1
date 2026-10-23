"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SAMPLES = 120;

/**
 * Handheld shake vs. GX1's gimbal. A smooth-noise "hand" plus pointer velocity
 * drives the raw signal; with the stabilizer on, the footage ignores it.
 * Everything runs in one rAF loop writing straight to the DOM — no re-renders —
 * and only while the section is on screen.
 */
export function StabilizerDemo({
  children,
  overlay,
}: {
  children: ReactNode;
  overlay?: ReactNode;
}) {
  const [on, setOn] = useState(true);
  const onRef = useRef(on);
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const rawLine = useRef<SVGPolylineElement>(null);
  const outLine = useRef<SVGPolylineElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    onRef.current = on;
  }, [on]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const raw: number[] = Array(SAMPLES).fill(0);
    const out: number[] = Array(SAMPLES).fill(0);
    const phase = [Math.random() * 10, Math.random() * 10, Math.random() * 10];
    let push = 0; // pointer energy, decays
    let lastX = 0;
    let lastY = 0;
    let smoothed = 0;
    let offAmount = 0; // 0 = gimbal on, 1 = fully handheld; eases between
    let jolt = 0; // occasional footstep bump
    let visible = false;
    let raf = 0;
    let t0 = performance.now();
    let lastSample = 0;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      push = Math.min(push + Math.hypot(dx, dy) * 0.04, 6);
    };

    const points = (arr: number[]) =>
      arr.map((v, i) => `${(i / (SAMPLES - 1)) * 1000},${50 + Math.max(-6.5, Math.min(6.5, v)) * 7}`).join(" ");

    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      push *= 0.94;
      // A tired hand: three detuned sines plus whatever the pointer adds.
      const hand =
        Math.sin(t * 2.1 + phase[0]) * 1.1 +
        Math.sin(t * 5.3 + phase[1]) * 0.55 +
        Math.sin(t * 11.7 + phase[2]) * 0.3 +
        Math.sin(t * 23 + phase[0]) * push * 0.35 +
        push * Math.sin(t * 7.9) * 0.5;

      // Footsteps: a sharp bump roughly every stride, decaying fast.
      if (Math.sin(t * 5.2) > 0.985 && jolt < 0.2) jolt = 1.6 + Math.random();
      jolt *= 0.86;

      // The gimbal drifts back to level; off, the frame takes every hit.
      const off = !onRef.current;
      offAmount += ((off ? 1 : 0) - offAmount) * 0.08;
      const target = off ? hand + jolt * Math.sin(t * 40) : 0;
      smoothed += (target - smoothed) * (off ? 0.6 : 0.08);

      if (frame.current) {
        const rot = Math.max(-7, Math.min(7, smoothed * 2.8));
        const ty = smoothed * 16 + jolt * 10 * offAmount;
        const tx = smoothed * -9;
        // Zoom in while handheld so the shaking frame never shows its edges.
        const scale = 1.1 + 0.16 * offAmount;
        frame.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(${scale})`;
      }

      if (now - lastSample > 33) {
        lastSample = now;
        raw.push(hand + jolt * Math.sin(t * 40));
        raw.shift();
        out.push(smoothed);
        out.shift();
        rawLine.current?.setAttribute("points", points(raw));
        outLine.current?.setAttribute("points", points(out));
        if (readout.current) {
          readout.current.textContent = `${Math.max(-7, Math.min(7, smoothed * 2.8)).toFixed(1).replace("-0.0", "0.0")}°`;
        }
      }

      if (visible) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) {
        t0 = performance.now() - 1000;
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el);

    if (reduced) {
      // Static illustration: a shaky raw trace and a flat output.
      for (let i = 0; i < SAMPLES; i++) raw[i] = Math.sin(i * 0.5) * 1.2 + Math.sin(i * 1.7) * 0.5;
      rawLine.current?.setAttribute("points", points(raw));
      outLine.current?.setAttribute("points", points(out));
    } else {
      el.addEventListener("pointermove", onMove, { passive: true });
    }

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      <div ref={frame} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.1)" }}>
        {children}
      </div>

      {overlay}

      {/* HUD level line: always level, because it is the HUD. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-[12%] top-1/2 h-px bg-hud/80">
        <span className="absolute -top-1.5 left-0 h-3.5 w-px bg-hud" />
        <span className="absolute -top-1.5 right-0 h-3.5 w-px bg-hud" />
        <span className="absolute -top-3 left-1/2 h-6 w-px -translate-x-1/2 bg-focus" />
      </div>

      <div className="absolute inset-x-4 bottom-4 sm:inset-x-8 sm:bottom-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <button
            type="button"
            aria-pressed={on}
            onClick={() => setOn((v) => !v)}
            className={cn(
              "group flex items-center gap-3 rounded-full border px-5 py-3 font-display text-lg font-semibold tracking-[0.12em] uppercase transition-colors duration-300",
              on
                ? "border-focus bg-focus text-ink"
                : "border-hud/70 bg-ink/50 text-hud hover:border-hud",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "relative h-5 w-9 rounded-full border transition-colors",
                on ? "border-ink bg-ink" : "border-hud/70",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-[left,background-color] duration-300 ease-out-expo",
                  on ? "left-[18px] bg-focus" : "left-0.5 bg-hud",
                )}
              />
            </span>
            Stabilizer {on ? "on" : "off"}
          </button>

          <div className="font-mono text-xs tracking-wider text-hud-dim uppercase">
            Roll <span ref={readout} className="tabular inline-block w-12 text-right text-hud">0.0°</span>
          </div>
        </div>

        <figure className="mt-4 rounded-sm bg-ink/55 px-3 pt-2 pb-1 backdrop-blur-sm">
          <figcaption className="flex justify-between font-mono text-[11px] tracking-wider uppercase">
            <span className="text-focus">Your hand</span>
            <span className="text-hud">What GX1 records</span>
          </figcaption>
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="h-14 w-full" aria-hidden="true">
            <line x1="0" y1="50" x2="1000" y2="50" stroke="var(--hud-faint)" strokeDasharray="4 6" />
            <polyline ref={rawLine} fill="none" stroke="var(--focus)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <polyline ref={outLine} fill="none" stroke="var(--hud)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </figure>
      </div>
    </div>
  );
}
