"use client";

// Adapted from Aceternity UI's Placeholders And Vanish Input
// (ui.aceternity.com/components/placeholders-and-vanish-input).
// Changes: it is a field, not a form, so it composes with a Server Action form;
// the vanish plays when the parent form reports success (`vanish` prop), and
// the styling follows the viewfinder HUD. Placeholder cycling pauses for
// reduced motion and hidden tabs.

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Particle = { x: number; y: number; r: number; color: string };

export function PlaceholdersAndVanishInput({
  placeholders,
  name,
  label,
  vanishKey,
  invalid,
  describedBy,
}: {
  placeholders: string[];
  name: string;
  label: string;
  /** Change this value to play the vanish animation and clear the field. */
  vanishKey?: string | number;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      interval ??= setInterval(
        () => setCurrentPlaceholder((p) => (p + 1) % placeholders.length),
        3000,
      );
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [placeholders]);

  const draw = useCallback(() => {
    const input = inputRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!input || !canvas || !ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const styles = getComputedStyle(input);
    const fontSize = parseFloat(styles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${styles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(input.value, 16, 40);

    const data = ctx.getImageData(0, 0, 800, 800).data;
    const next: Particle[] = [];
    for (let y = 0; y < 800; y++) {
      const row = 4 * y * 800;
      for (let x = 0; x < 800; x++) {
        const e = row + 4 * x;
        if (data[e] !== 0 && data[e + 1] !== 0 && data[e + 2] !== 0) {
          next.push({
            x,
            y,
            r: 1,
            color: `rgba(${data[e]}, ${data[e + 1]}, ${data[e + 2]}, ${data[e + 3]})`,
          });
        }
      }
    }
    particles.current = next;
  }, []);

  const vanish = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !inputRef.current?.value) {
      setValue("");
      return;
    }
    draw();
    setAnimating(true);
    const maxX = particles.current.reduce((m, p) => (p.x > m ? p.x : m), 0);

    const frame = (pos: number) => {
      requestAnimationFrame(() => {
        const kept: Particle[] = [];
        for (const p of particles.current) {
          if (p.x < pos) {
            kept.push(p);
          } else {
            if (p.r <= 0) continue;
            p.x += Math.random() > 0.5 ? 1 : -1;
            p.y += Math.random() > 0.5 ? 1 : -1;
            p.r -= 0.05 * Math.random();
            kept.push(p);
          }
        }
        particles.current = kept;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          for (const p of kept) {
            if (p.x > pos) {
              ctx.beginPath();
              ctx.rect(p.x, p.y, p.r, p.r);
              ctx.fillStyle = p.color;
              ctx.strokeStyle = p.color;
              ctx.stroke();
            }
          }
        }
        if (kept.length > 0) frame(pos - 8);
        else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    frame(maxX);
  }, [draw]);

  const lastKey = useRef(vanishKey);
  useEffect(() => {
    if (vanishKey !== undefined && vanishKey !== lastKey.current) {
      lastKey.current = vanishKey;
      vanish();
    }
  }, [vanishKey, vanish]);

  return (
    <div
      className={cn(
        "relative h-14 w-full overflow-hidden rounded-full border bg-ink/70 transition-colors duration-200",
        invalid ? "border-rec" : "border-hud/40 focus-within:border-focus",
      )}
    >
      <canvas
        className={cn(
          "pointer-events-none absolute top-[22%] left-5 origin-top-left scale-50 pr-20 sm:left-6",
          animating ? "opacity-100" : "opacity-0",
        )}
        ref={canvasRef}
      />
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="email"
        autoComplete="email"
        inputMode="email"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => !animating && setValue(e.target.value)}
        ref={inputRef}
        value={value}
        className={cn(
          "relative z-10 h-full w-full rounded-full border-none bg-transparent pr-40 pl-5 text-base text-hud focus:ring-0 focus:outline-none sm:pl-6",
          animating && "text-transparent",
        )}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center rounded-full">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              key={`placeholder-${currentPlaceholder}`}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              className="w-[calc(100%-11rem)] truncate pl-5 text-left text-base text-hud-dim sm:pl-6"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
