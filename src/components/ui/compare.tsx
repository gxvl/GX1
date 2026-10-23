"use client";

// Adapted from Aceternity UI's Compare (ui.aceternity.com/components/compare).
// Changes: images arrive as server-rendered nodes (next/image), the sparkle
// particles and indigo glow are gone in favor of the viewfinder's focus line,
// and a native range input makes it keyboard and screen-reader operable.

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CompareProps {
  first: ReactNode;
  second: ReactNode;
  firstLabel: string;
  secondLabel: string;
  className?: string;
  initialSliderPercentage?: number;
  autoplay?: boolean;
  autoplayDuration?: number;
}

export const Compare = ({
  first,
  second,
  firstLabel,
  secondLabel,
  className,
  initialSliderPercentage = 50,
  autoplay = true,
  autoplayDuration = 6000,
}: CompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<number | null>(null);
  const touched = useRef(false);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) cancelAnimationFrame(autoplayRef.current);
    autoplayRef.current = null;
  }, []);

  const startAutoplay = useCallback(() => {
    if (!autoplay || touched.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = ((now - startTime) % (autoplayDuration * 2)) / autoplayDuration;
      const eased = progress <= 1 ? progress : 2 - progress;
      // Sweep between 20% and 80% so neither side ever disappears.
      setSliderXPercent(20 + (0.5 - Math.cos(eased * Math.PI) / 2) * 60);
      autoplayRef.current = requestAnimationFrame(animate);
    };
    autoplayRef.current = requestAnimationFrame(animate);
  }, [autoplay, autoplayDuration]);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startAutoplay();
      else stopAutoplay();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      stopAutoplay();
    };
  }, [startAutoplay, stopAutoplay]);

  const takeOver = () => {
    touched.current = true;
    stopAutoplay();
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current || !isDragging) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const percent = ((clientX - rect.left) / rect.width) * 100;
      setSliderXPercent(Math.max(0, Math.min(100, percent)));
    },
    [isDragging],
  );

  return (
    <div
      ref={sliderRef}
      className={cn("relative touch-pan-y overflow-hidden select-none has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-focus", className)}
      style={{ cursor: isDragging ? "grabbing" : "ew-resize" }}
      onPointerDown={(e) => {
        takeOver();
        setIsDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        const rect = e.currentTarget.getBoundingClientRect();
        setSliderXPercent(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
      }}
      onPointerMove={(e) => handleMove(e.clientX)}
      onPointerUp={() => setIsDragging(false)}
      onPointerCancel={() => setIsDragging(false)}
      // Native image drag would steal the pointer and cancel the slider.
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="pointer-events-none absolute inset-0 [&_img]:[-webkit-user-drag:none]">{second}</div>
      <div
        className="pointer-events-none absolute inset-0 [&_img]:[-webkit-user-drag:none]"
        style={{ clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)` }}
      >
        {first}
      </div>

      <span className="pointer-events-none absolute bottom-6 left-4 z-10 rounded-sm bg-hud px-2 py-1 font-mono text-[11px] tracking-wider text-ink uppercase sm:left-8">
        {firstLabel}
      </span>
      <span className="pointer-events-none absolute right-4 bottom-6 z-10 rounded-sm bg-focus px-2 py-1 font-mono text-[11px] tracking-wider text-ink uppercase">
        {secondLabel}
      </span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 bottom-0 w-px bg-focus"
        style={{ left: `${sliderXPercent}%` }}
      >
        <div className="focus-brackets absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 [--l:10px]" />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(sliderXPercent)}
        onChange={(e) => {
          takeOver();
          setSliderXPercent(Number(e.target.value));
        }}
        aria-label={`Compare ${firstLabel} and ${secondLabel}`}
        className="absolute inset-x-0 bottom-0 h-full w-full cursor-ew-resize opacity-0"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
};
