"use client";

// Adapted from Aceternity UI's Lens (ui.aceternity.com/components/lens).
// Changes: the lens is a square punch-in frame with focus brackets instead of a
// circle (a 4K crop is rectangular), it works with touch via pointer events,
// it rests at a default position so the effect is visible before hover, and
// the magnified layer can take its own higher-resolution source (`zoomed`), so a
// punch-in shows real pixels instead of an upscaled screen-sized image.

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface LensProps {
  children: React.ReactNode;
  /** Rendered inside the magnified layer; defaults to `children`. */
  zoomed?: React.ReactNode;
  zoomFactor?: number;
  lensSize?: number;
  defaultPosition?: { x: number; y: number }; // fractions of the box
}

export const Lens: React.FC<LensProps> = ({
  children,
  zoomed,
  zoomFactor = 2,
  lensSize = 220,
  defaultPosition = { x: 0.62, y: 0.42 },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const x = pos?.x ?? (box ? box.width * defaultPosition.x : 0);
  const y = pos?.y ?? (box ? box.height * defaultPosition.y : 0);
  const half = lensSize / 2;
  const clip = `inset(${y - half}px calc(100% - ${x + half}px) calc(100% - ${y + half}px) ${x - half}px)`;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-crosshair touch-pan-y overflow-hidden"
      onDragStart={(e) => e.preventDefault()}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      {children}

      <AnimatePresence>
        {(active || box) && (
          <motion.div
            key="lens"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0"
            style={{ clipPath: clip }}
          >
            <div
              className="absolute inset-0"
              style={{ transform: `scale(${zoomFactor})`, transformOrigin: `${x}px ${y}px` }}
            >
              {zoomed ?? children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {box && (
        <div
          aria-hidden="true"
          className="focus-brackets pointer-events-none absolute"
          style={{ left: x - half, top: y - half, width: lensSize, height: lensSize }}
        >
          <span className="absolute -top-7 left-0 rounded-sm bg-ink/75 px-1.5 py-0.5 font-mono text-[11px] tracking-wider text-focus uppercase">
            {zoomFactor}× punch-in
          </span>
        </div>
      )}
    </div>
  );
};
