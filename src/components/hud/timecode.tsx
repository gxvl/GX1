"use client";

import { useEffect, useState } from "react";

const FPS = 24;

function format(frames: number) {
  const f = frames % FPS;
  const s = Math.floor(frames / FPS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
}

/** Running record timecode. The only moving number on the page, so it gets its own tiny island. */
export function Timecode({ startAt = 0 }: { startAt?: number }) {
  const [frames, setFrames] = useState(startAt * FPS);

  useEffect(() => {
    const start = performance.now() - startAt * 1000;
    let raf = 0;
    const tick = () => {
      setFrames(Math.floor(((performance.now() - start) / 1000) * FPS));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startAt]);

  return (
    <span className="tabular font-mono" aria-hidden="true">
      {format(frames)}
    </span>
  );
}
