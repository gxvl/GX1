"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SAMPLES = 120;
const MAX_ROLL = 8; // degrees, handheld (pointer)
const MAX_PHONE_ROLL = 40; // degrees, gyroscope
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

type IOSOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type Aim = { x: number; y: number; lastInput: number; tilt: boolean; roll: number };

const isTouch = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches &&
  typeof DeviceOrientationEvent !== "undefined";

const noopSubscribe = () => () => {};

/**
 * Phone roll in the screen plane (the "steering wheel" angle), in degrees,
 * positive when the phone turns clockwise. Gravity in device coordinates
 * follows from the W3C Z-X'-Y'' Euler angles: (sinγ·cosβ, −sinβ, −cosγ·cosβ).
 * The screen orientation angle is added so landscape reads as level too.
 */
function screenRoll(beta: number, gamma: number) {
  const b = (beta * Math.PI) / 180;
  const g = (gamma * Math.PI) / 180;
  const gx = Math.sin(g) * Math.cos(b);
  const gy = -Math.sin(b);
  // Lying flat, gravity leaves the screen plane and roll is meaningless.
  const inPlane = Math.hypot(gx, gy);
  if (inPlane < 0.3) return 0;
  const screenAngle =
    screen.orientation?.angle ?? (window as { orientation?: number }).orientation ?? 0;
  let roll = (Math.atan2(gx, -gy) * 180) / Math.PI + screenAngle;
  roll = ((roll + 540) % 360) - 180;
  // Fade in as the phone comes upright, so tipping it flat doesn't snap.
  return roll * Math.min(1, (inPlane - 0.3) / 0.3);
}

function listenTilt(aim: Aim, onFirst: () => void) {
  let first = true;
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    if (first) {
      first = false;
      onFirst();
    }
    aim.roll = screenRoll(e.beta, e.gamma);
    aim.tilt = true;
  };
  window.addEventListener("deviceorientation", onTilt);
  return () => window.removeEventListener("deviceorientation", onTilt);
}

/**
 * You are the hand holding the camera. On desktop the pointer is where the
 * hand aims; the frame follows it.
 *
 * Stabilizer off: a loose, underdamped spring chases the hand, overshoots,
 * rolls with it and carries tremor plus footstep bumps, so the horizon tips.
 * Stabilizer on: a slow critically-damped follow with roll locked at zero:
 * you can still aim, but the horizon stays level.
 *
 * On phones the screen is the camera. "Test the stabilizer" asks for motion
 * access (iOS) or just starts the sensor (Android), then the gyroscope measures how far the
 * phone is rolled, and with the stabilizer on the footage counter-rotates by
 * that angle (zooming just enough to hide its corners), so its horizon stays
 * level with the real one. The HUD level line shows the true horizon.
 *
 * Safari only lets a muted video autoplay while most of the element is on
 * screen, and the counter-rotation zooms it to ~2.3x. So in gyroscope mode
 * the <video> itself stays untransformed at screen size and a <canvas> on top
 * draws each frame rotated and zoomed.
 *
 * One rAF loop writes transforms straight to the DOM (no re-renders), runs
 * only while on screen, and stays still under reduced motion.
 */
export function StabilizerDemo({
  children,
  overlay,
  videoId,
}: {
  children: ReactNode;
  /** The footage <video> inside `children`, drawn to canvas in gyroscope mode. */
  videoId?: string;
  overlay?: ReactNode;
}) {
  const [on, setOn] = useState(false);
  const touch = useSyncExternalStore(noopSubscribe, isTouch, () => false);
  const [gyro, setGyro] = useState<"idle" | "starting" | "active" | "unavailable">("idle");
  const onRef = useRef(on);
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const rawLine = useRef<SVGPolylineElement>(null);
  const outLine = useRef<SVGPolylineElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const levelLine = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const aim = useRef<Aim>({ x: 0, y: 0, lastInput: -Infinity, tilt: false, roll: 0 });
  const stopTilt = useRef<(() => void) | null>(null);

  useEffect(() => {
    onRef.current = on;
  }, [on]);

  useEffect(() => () => stopTilt.current?.(), []);

  /** One tap: get motion access, start the gyroscope, switch the stabilizer on. */
  async function startGyro() {
    setGyro("starting");
    try {
      // iOS gates motion sensors behind a user gesture; Android does not.
      const request = (DeviceOrientationEvent as IOSOrientationEvent).requestPermission;
      if (request && (await request()) !== "granted") {
        setGyro("unavailable");
        return;
      }
    } catch {
      setGyro("unavailable");
      return;
    }
    let started = false;
    stopTilt.current?.();
    stopTilt.current = listenTilt(aim.current, () => {
      started = true;
      setGyro("active");
      setOn(true);
    });
    // Some devices expose the API but never send readings.
    setTimeout(() => {
      if (started) return;
      stopTilt.current?.();
      stopTilt.current = null;
      setGyro("unavailable");
    }, 2000);
  }

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Pointer steering is a desktop thing; phones use the gyroscope instead.
    const fine = window.matchMedia("(pointer: fine)").matches;
    // Phones get flat 2D transforms only: WebKit can stall or pause video
    // inside large 3D-transformed layers.
    el.style.perspective = fine ? "1400px" : "none";

    const raw: number[] = Array(SAMPLES).fill(0);
    const out: number[] = Array(SAMPLES).fill(0);
    const phase = [Math.random() * 10, Math.random() * 10, Math.random() * 10];

    // Hand: where the camera body points (spring towards the aim).
    let hx = 0, hy = 0, vx = 0, vy = 0;
    // Output: what the recorded frame does.
    let ox = 0, oy = 0, oRoll = 0;
    let offAmount = 1;
    let jolt = 0;
    let phoneRoll = 0; // smoothed gyroscope roll
    let box = { w: el.clientWidth, h: el.clientHeight };
    const ro = new ResizeObserver(() => (box = { w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    let visible = false;
    let raf = 0;
    let lastSample = 0;
    const t0 = performance.now();

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      aim.current.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, 1);
      aim.current.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, 1);
      aim.current.lastInput = performance.now();
    };
    const onLeave = () => {
      aim.current.lastInput = -Infinity;
    };

    const points = (arr: number[], range: number) =>
      arr
        .map((v, i) => `${(i / (SAMPLES - 1)) * 1000},${50 + (clamp(v, range) / range) * 44}`)
        .join(" ");

    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      const off = !onRef.current;
      offAmount += ((off ? 1 : 0) - offAmount) * 0.06;

      const tilt = aim.current.tilt;
      phoneRoll += (clamp(aim.current.roll, MAX_PHONE_ROLL) - phoneRoll) * 0.35;

      // Without input, drift gently so the frame is never dead. On phones the
      // visitor's own hand provides the motion, so no drift there.
      const idle = now - aim.current.lastInput > 2500;
      const ax = idle ? (fine ? Math.sin(t * 0.45) * 0.55 : 0) : aim.current.x;
      const ay = idle ? (fine ? Math.sin(t * 0.31 + 1) * 0.3 : 0) : aim.current.y;

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
      // Gyroscope compensation: counter-rotate by the phone's roll when on.
      const comp = tilt ? -phoneRoll * (1 - offAmount) : 0;
      // What the recorded horizon does relative to the real one.
      const horizon = tilt ? phoneRoll + roll + comp : roll;

      const tx = ox * 3.2; // vw
      const ty = oy * 2.4; // vh
      // Rotating a W×H frame by a needs cos(a) + max(W/H, H/W)·sin(a) to cover it.
      const a = (Math.abs(roll + comp) * Math.PI) / 180;
      const ratio = Math.max(box.w / box.h, box.h / box.w) || 1;
      const cover = tilt ? Math.cos(a) + ratio * Math.sin(a) : 1;
      const scale = (1.14 + 0.08 * offAmount) * Math.max(1, cover);
      const video = tilt && videoId ? (document.getElementById(videoId) as HTMLVideoElement | null) : null;

      if (video && canvas.current && video.readyState >= 2 && video.videoWidth) {
        // Gyroscope mode: the <video> stays at screen size (so Safari keeps it
        // playing) and the canvas draws it rotated and zoomed.
        const c = canvas.current;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = box.w;
        const H = box.h;
        if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
          c.width = Math.round(W * dpr);
          c.height = Math.round(H * dpr);
        }
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.translate(W / 2 + (tx * window.innerWidth) / 100, H / 2 + (ty * window.innerHeight) / 100);
          ctx.rotate(((roll + comp) * Math.PI) / 180);
          ctx.scale(scale, scale);
          // object-fit: cover, centred
          const k = Math.max(W / video.videoWidth, H / video.videoHeight);
          const dw = video.videoWidth * k;
          const dh = video.videoHeight * k;
          ctx.drawImage(video, -dw / 2, -dh / 2, dw, dh);
        }
        c.style.opacity = "1";
        if (frame.current) frame.current.style.transform = "none";
      } else {
        if (canvas.current) canvas.current.style.opacity = "0";
        if (frame.current) {
          const ry = ox * 5;
          const rx = -oy * 3.5;
          frame.current.style.transform = fine
            ? `translate3d(${tx}vw, ${ty}vh, 0) rotateY(${ry}deg) rotateX(${rx}deg) rotate(${roll + comp}deg) scale(${scale})`
            : `translate(${tx}vw, ${ty}vh) rotate(${roll + comp}deg) scale(${scale})`;
        }
      }
      if (levelLine.current) {
        // On phones the level line is a real level: it marks the true horizon.
        levelLine.current.style.transform = tilt ? `rotate(${-phoneRoll}deg)` : "";
      }

      if (now - lastSample > 33) {
        lastSample = now;
        const range = tilt ? MAX_PHONE_ROLL : MAX_ROLL;
        raw.push(tilt ? phoneRoll + handRoll * 0.3 : handRoll);
        raw.shift();
        out.push(horizon);
        out.shift();
        rawLine.current?.setAttribute("points", points(raw, range));
        outLine.current?.setAttribute("points", points(out, range));
        if (readout.current) {
          readout.current.textContent = `${horizon.toFixed(1).replace("-0.0", "0.0")}°`;
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
      rawLine.current?.setAttribute("points", points(raw, MAX_ROLL));
      outLine.current?.setAttribute("points", points(out, MAX_ROLL));
      if (frame.current) frame.current.style.transform = "scale(1.14)";
    } else if (fine) {
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);
    }

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [videoId]);

  return (
    <div ref={root} className="absolute inset-0 touch-pan-y overflow-hidden">
      <div
        ref={frame}
        className="absolute inset-0 will-change-transform"
        style={{ transform: "scale(1.22)" }}
      >
        {children}
      </div>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      />

      {overlay}

      {/* HUD level line: level with the screen on desktop; on phones it tracks the true horizon. */}
      <div
        ref={levelLine}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[12%] top-1/2 h-px bg-hud/80"
      >
        <span className="absolute -top-1.5 left-0 h-3.5 w-px bg-hud" />
        <span className="absolute -top-1.5 right-0 h-3.5 w-px bg-hud" />
        <span className="absolute -top-3 left-1/2 h-6 w-px -translate-x-1/2 bg-focus" />
      </div>

      <div className="absolute inset-x-4 bottom-4 sm:inset-x-8 sm:bottom-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {touch && (gyro === "idle" || gyro === "starting") ? (
              <button
                type="button"
                onClick={startGyro}
                disabled={gyro === "starting"}
                className="flex items-center gap-3 rounded-full bg-focus px-5 py-3 font-display text-lg font-semibold tracking-[0.12em] text-ink uppercase transition-opacity disabled:opacity-70"
              >
                <span aria-hidden="true" className="relative grid h-5 w-5 place-items-center rounded-full border-2 border-ink">
                  <span className="h-px w-3 bg-ink" />
                </span>
                {gyro === "starting" ? "Starting…" : "Test the stabilizer"}
              </button>
            ) : (
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
            )}
            <p className="rounded-sm bg-ink/60 px-2 py-1 font-mono text-[11px] tracking-wider text-hud-dim uppercase backdrop-blur-sm">
              {!touch
                ? "Move your pointer to steer"
                : gyro === "active"
                  ? on
                    ? "Tilt your phone: the horizon holds"
                    : "Off: the horizon tilts with you"
                  : gyro === "unavailable"
                    ? "No motion sensor available"
                    : "Uses your phone's motion sensor"}
            </p>
          </div>

          <div className="font-mono text-xs tracking-wider text-hud-dim uppercase">
            Horizon <span ref={readout} className="tabular inline-block w-12 text-right text-hud">0.0°</span>
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
