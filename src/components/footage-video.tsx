"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Looping, muted footage over a next/image poster. The poster is the real
 * content (and the LCP); the video fades in once it actually plays, runs only
 * while on screen, and never loads under reduced motion. The file is chosen on
 * mount (720p for phones, 1440p otherwise): <source media> is not honored by
 * every engine, and choosing in JS also keeps reduced-motion visitors at 0 bytes.
 */
export function FootageVideo({
  poster,
  alt,
  src,
  srcSmall,
  priority = false,
  className,
  id,
}: {
  poster: StaticImageData;
  alt: string;
  src: string;
  srcSmall: string;
  priority?: boolean;
  className?: string;
  /** Lets a <VideoToggle> elsewhere in the tree control this video. */
  id?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    el.src = window.matchMedia("(max-width: 767px)").matches ? srcSmall : src;
    let visible = false;
    const resume = () => {
      if (visible && !el.dataset.userPaused && el.paused) el.play().catch(() => {});
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) resume();
        else el.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    // Watchdog: browsers sometimes pause a heavily transformed or re-laid-out
    // video on their own (phone rotation, power heuristics). If it's on screen
    // and the visitor didn't pause it, play it again.
    // `visible` is already false when we pause it for being off screen,
    // so only pauses the visitor didn't ask for get undone.
    const onPause = () => requestAnimationFrame(resume);
    const onVisibility = () => document.visibilityState === "visible" && resume();
    el.addEventListener("pause", onPause);
    window.addEventListener("resize", resume);
    window.addEventListener("orientationchange", resume);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      el.removeEventListener("pause", onPause);
      window.removeEventListener("resize", resume);
      window.removeEventListener("orientationchange", resume);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [src, srcSmall]);

  return (
    <>
      <Image
        src={poster}
        alt={alt}
        placeholder="blur"
        priority={priority}
        fill
        sizes="100vw"
        className={cn("object-cover", className)}
      />
      <video
        ref={video}
        id={id}
        muted
        loop
        playsInline
        preload={priority ? "auto" : "none"}
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
          playing ? "opacity-100" : "opacity-0",
          className,
        )}
      />

    </>
  );
}

/**
 * Pause/play for a FootageVideo, placed anywhere (WCAG 2.2.2: moving content
 * longer than five seconds needs a pause). Mirrors the video's real state.
 */
export function VideoToggle({ targetId, className }: { targetId: string; className?: string }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId) as HTMLVideoElement | null;
    if (!el) return;
    const sync = () => setPaused(el.paused || Boolean(el.dataset.userPaused));
    sync();
    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    return () => {
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
    };
  }, [targetId]);

  const toggle = () => {
    const el = document.getElementById(targetId) as HTMLVideoElement | null;
    if (!el) return;
    if (el.paused) {
      delete el.dataset.userPaused;
      el.play().catch(() => {});
    } else {
      el.dataset.userPaused = "1";
      el.pause();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={paused ? "Play background footage" : "Pause background footage"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border border-hud/50 bg-ink/50 text-hud backdrop-blur-sm transition-colors hover:border-hud",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
        {paused ? (
          <path d="M4 2.5v11l9-5.5z" />
        ) : (
          <>
            <rect x="3.5" y="2.5" width="3" height="11" rx="0.5" />
            <rect x="9.5" y="2.5" width="3" height="11" rx="0.5" />
          </>
        )}
      </svg>
    </button>
  );
}
