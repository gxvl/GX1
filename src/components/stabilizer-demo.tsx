"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SAMPLES = 120;
const MAX_ROLL = 8; // degrees, handheld
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

type IOSOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type Aim = { x: number; y: number; lastInput: number; tilt: boolean };

const isTouch = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches &&
  typeof DeviceOrientationEvent !== "undefined";

/** iOS gates motion sensors behind a user gesture; Android does not. */
const tiltNeedsPermission = () =>
  isTouch() &&
  typeof (DeviceOrientationEvent as IOSOrientationEvent).requestPermission === "function";

const noopSubscribe = () => () => {};

/** Maps phone tilt to an aim in [-1, 1]; the first reading is "level". */
function listenTilt(aim: Aim, onFirst: () => void) {
  let base: number | null = null;
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    if (base === null) {
      base = e.beta;
      onFirst();
    }
    aim.x = clamp(e.gamma / 25, 1);
    aim.y = clamp((e.beta - base) / 20, 1);
    aim.lastInput = performance.now();
    aim.tilt = true;
  };
  window.addEventListener("deviceorientation", onTilt);
  return () => window.removeEventListener("deviceorientation", onTilt);
}

/**
 * You are the hand holding the camera. Pointer position (or phone tilt) is
 * where the hand aims; the frame follows it.
 *
 * Stabilizer off: a loose, underdamped spring chases the hand, overshoots,
 * rolls with it and carries tremor plus footstep bumps, so the horizon tips.
 * Stabilizer on: a slow critically-damped follow with roll locked at zero:
 * you can still aim, but the horizon stays level.
 *
 * One rAF loop writes transforms straight to the DOM (no re-renders), runs
 * only while on screen, and stays still under reduced motion.
 */
export function StabilizerDemo({
  children,
  overlay,
}: {
  children: ReactNode;
  overlay?: ReactNode;
}) {
  const [on, setOn] = useState(false);
  const needsPermission = useSyncExternalStore(noopSubscribe, tiltNeedsPermission, () => false);
  const [tiltActive, setTiltActive] = useState(false);
  const [tiltDenied, setTiltDenied] = useState(false);
  const onRef = useRef(on);
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const rawLine = useRef<SVGPolylineElement>(null);
  const outLine = useRef<SVGPolylineElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const aim = useRef<Aim>({ x: 0, y: 0, lastInput: -Infinity, tilt: false });
  const stopTilt = useRef<(() => void) | null>(null);

  useEffect(() => {
    onRef.current = on;
  }, [on]);

  // Phone tilt: Android delivers events without asking; iOS waits for a tap.
  useEffect(() => {
    if (!isTouch() || tiltNeedsPermission()) return;
    return listenTilt(aim.current, () => setTiltActive(true));
  }, []);
  useEffect(() => () => stopTilt.current?.(), []);

  async function requestTilt() {
    try {
      const res = await (DeviceOrientationEvent as IOSOrientationEvent).requestPermission?.();
      if (res === "granted") {
        stopTilt.current = listenTilt(aim.current, () => setTiltActive(true));
      } else {
        setTiltDenied(true);
      }
    } catch {
      setTiltDenied(true);
    }
  }

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const raw: number[] = Array(SAMPLES).fill(0);
    const out: number[] = Array(SAMPLES).fill(0);
    const phase = [Math.random() * 10, Math.random() * 10, Math.random() * 10];

    // Hand: where the camera body points (spring towards the aim).
    let hx = 0, hy = 0, vx = 0, vy = 0;
    // Output: what the recorded frame does.
    let ox = 0, oy = 0, oRoll = 0;
    let offAmount = 1;
    let jolt = 0;
    let visible = false;
    let raf = 0;
    let lastSample = 0;
    const t0 = performance.now();

    const onMove = (e: PointerEvent) => {
      if (aim.current.tilt) return;
      const r = el.getBoundingClientRect();
      aim.current.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, 1);
      aim.current.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, 1);
      aim.current.lastInput = performance.now();
    };
    const onLeave = () => {
      if (!aim.current.tilt) aim.current.lastInput = -Infinity;
    };

    const points = (arr: number[]) =>
      arr
        .map((v, i) => `${(i / (SAMPLES - 1)) * 1000},${50 + clamp(v, MAX_ROLL) * 5.5}`)
        .join(" ");

    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      const off = !onRef.current;
      offAmount += ((off ? 1 : 0) - offAmount) * 0.06;

      // Without input, drift gently so the frame is never dead.
      const idle = now - aim.current.lastInput > 2500;
      const ax = idle ? Math.sin(t * 0.45) * 0.55 : aim.current.x;
      const ay = idle ? Math.sin(t * 0.31 + 1) * 0.3 : aim.current.y;

      // Hand dynamics: a loose spring that overshoots, like a wrist.
      vx = (vx + (ax - hx) * 0.045) * 0.86;
      vy = (vy + (ay - hy) * 0.045) * 0.86;
      hx += vx;
      hy += vy;

      // Tremor and footsteps, the part a gimbal exists to remove.
      if (Math.sin(t * 5.4) > 0.985 && jolt < 0.2) jolt = 1 + Math.random() * 0.8;
      jolt *= 0.85;
      const tremor =
        Math.sin(t * 9.1 + phase[0]) * 0.35 +
        Math.sin(t * 15.7 + phase[1]) * 0.2 +
        Math.sin(t * 3.3 + phase[2]) * 0.45;
      const bump = jolt * Math.sin(t * 38);

      // Hand roll: wrists roll as they swing sideways, plus tremor.
      const handRoll = hx * 5 + vx * 40 + tremor * 1.6 + bump * 1.8;

      if (off) {
        ox = hx + tremor * 0.025 + bump * 0.03;
        oy = hy + tremor * 0.02 + bump * 0.05;
        oRoll = handRoll;
      } else {
        // Gimbal: slow, critically damped aim; roll held level.
        ox += (hx - ox) * 0.05;
        oy += (hy - oy) * 0.05;
        oRoll += (0 - oRoll) * 0.12;
      }

      const roll = clamp(oRoll, MAX_ROLL);
      if (frame.current) {
        const tx = ox * 3.2; // vw
        const ty = oy * 2.4; // vh
        const ry = ox * 5;
        const rx = -oy * 3.5;
        const scale = 1.14 + 0.08 * offAmount;
        frame.current.style.transform = `translate3d(${tx}vw, ${ty}vh, 0) rotateY(${ry}deg) rotateX(${rx}deg) rotate(${roll}deg) scale(${scale})`;
      }

      if (now - lastSample > 33) {
        lastSample = now;
        raw.push(handRoll);
        raw.shift();
        out.push(roll);
        out.shift();
        rawLine.current?.setAttribute("points", points(raw));
        outLine.current?.setAttribute("points", points(out));
        if (readout.current) {
          readout.current.textContent = `${roll.toFixed(1).replace("-0.0", "0.0")}°`;
        }
      }

      if (visible) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(el);

    if (reduced) {
      for (let i = 0; i < SAMPLES; i++) raw[i] = Math.sin(i * 0.3) * 4 + Math.sin(i * 1.7) * 1.2;
      rawLine.current?.setAttribute("points", points(raw));
      outLine.current?.setAttribute("points", points(out));
      if (frame.current) frame.current.style.transform = "scale(1.14)";
    } else {
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);
    }

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={root} className="absolute inset-0 touch-pan-y overflow-hidden [perspective:1400px]">
      <div
        ref={frame}
        className="absolute inset-0 will-change-transform"
        style={{ transform: "scale(1.22)" }}
      >
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
          <div className="flex flex-wrap items-center gap-3">
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

            {needsPermission && !tiltActive && !tiltDenied && (
              <button
                type="button"
                onClick={requestTilt}
                className="rounded-full border border-hud/70 bg-ink/50 px-4 py-3 font-display text-base font-semibold tracking-[0.12em] text-hud uppercase backdrop-blur-sm transition-colors hover:border-hud"
              >
                Steer with tilt
              </button>
            )}
            <p className="rounded-sm bg-ink/60 px-2 py-1 font-mono text-[11px] tracking-wider text-hud-dim uppercase backdrop-blur-sm">
              <span className="hidden [@media(pointer:fine)]:inline">Move your pointer to steer</span>
              <span className="[@media(pointer:fine)]:hidden">
                {tiltActive ? "Tilt your phone to steer" : "Drag across the frame to steer"}
              </span>
            </p>
          </div>

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
