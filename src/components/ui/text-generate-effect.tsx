"use client";

// Adapted from Aceternity UI's Text Generate Effect
// (ui.aceternity.com/components/text-generate-effect).
// Changes: used as live captions, so it plays when scrolled into view, replays
// line by line, keeps text in the DOM for screen readers and no-JS, and shows
// the finished caption at once under reduced motion.

import { useEffect, useRef } from "react";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  lines,
  className,
  duration = 0.4,
}: {
  lines: string[];
  className?: string;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const inView = useInView(scope, { amount: 0.6 });
  const index = useRef(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;

    const play = async () => {
      while (!cancelled) {
        const root = scope.current as HTMLElement | null;
        const all = root ? Array.from(root.querySelectorAll<HTMLElement>("[data-line]")) : [];
        const line = all[index.current];
        all.forEach((el) => (el.hidden = el !== line));
        if (!line) return;
        await animate(line.querySelectorAll("span"), { opacity: 0, filter: "blur(8px)" }, { duration: 0 });
        await animate(
          line.querySelectorAll("span"),
          { opacity: 1, filter: "blur(0px)" },
          { duration, delay: stagger(0.14) },
        );
        await new Promise((r) => setTimeout(r, 2200));
        index.current = (index.current + 1) % lines.length;
      }
    };
    play();
    return () => {
      cancelled = true;
    };
  }, [inView, animate, duration, lines.length, scope]);

  return (
    <div ref={scope} className={cn(className)}>
      {lines.map((line, i) => (
        <p key={i} data-line hidden={i !== 0}>
          {line.split(" ").map((word, idx) => (
            <motion.span key={word + idx} className="inline-block">
              {word}&nbsp;
            </motion.span>
          ))}
        </p>
      ))}
    </div>
  );
};
