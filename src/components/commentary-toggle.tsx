"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Turns on the director's commentary: notes are already in the server HTML,
 * this only flips a data attribute on <html> so CSS reveals them.
 */
export function CommentaryToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.commentary = on ? "on" : "off";
  }, [on]);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-200",
        on ? "border-focus bg-focus text-ink" : "border-hud/40 text-hud hover:border-hud",
      )}
    >
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", on ? "bg-ink" : "bg-focus")} />
      <span>
        <span className="sm:hidden">Notes</span>
        <span className="hidden sm:inline">Commentary</span>
        <span className="sr-only">: how this page is built</span>
      </span>
    </button>
  );
}
