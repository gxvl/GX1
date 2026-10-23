import type { Finish } from "@/lib/catalog";

/**
 * The GX1, drawn as SVG so every finish renders from the same three colors.
 * Server component: zero client JS.
 */
export function GX1Device({
  finish,
  className,
}: {
  finish: Finish;
  className?: string;
}) {
  const id = `gx1-${finish.id}`;
  return (
    <svg
      viewBox="0 0 160 430"
      className={className}
      role="img"
      aria-label={`GX1 in ${finish.name}`}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor={finish.light} />
          <stop offset="0.38" stopColor={finish.body} />
          <stop offset="1" stopColor={finish.shade} />
        </linearGradient>
        <radialGradient id={`${id}-glass`} cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#5b6b86" />
          <stop offset="0.35" stopColor="#1a2233" />
          <stop offset="1" stopColor="#05070b" />
        </radialGradient>
        <radialGradient id={`${id}-floor`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* contact shadow */}
      <ellipse cx="80" cy="414" rx="62" ry="10" fill={`url(#${id}-floor)`} />

      {/* grip */}
      <rect x="36" y="150" width="88" height="256" rx="34" fill={`url(#${id}-body)`} />
      <rect x="36" y="150" width="88" height="256" rx="34" fill="none" stroke="#000" strokeOpacity="0.18" />

      {/* display, showing its own tiny viewfinder */}
      <rect x="47" y="174" width="66" height="100" rx="9" fill="#0b0b0b" />
      <rect x="51" y="178" width="58" height="92" rx="6" fill="#20262c" />
      <rect x="51" y="236" width="58" height="34" fill="#3b4148" />
      <line x1="56" y1="224" x2="104" y2="224" stroke="#f5f5f0" strokeOpacity="0.7" strokeWidth="0.8" />
      <circle cx="58" cy="185" r="2.2" fill="#ff2d2d" />
      <rect x="63" y="183.5" width="20" height="3" rx="1" fill="#f5f5f0" fillOpacity="0.7" />

      {/* record + function buttons */}
      <circle cx="80" cy="318" r="12" fill={finish.shade} />
      <circle cx="80" cy="318" r="6" fill="#ff2d2d" />
      <rect x="69" y="346" width="22" height="6" rx="3" fill={finish.shade} />

      {/* pan motor */}
      <rect x="57" y="126" width="46" height="30" rx="7" fill={finish.shade} />
      <rect x="57" y="126" width="46" height="8" rx="4" fill={finish.light} fillOpacity="0.35" />

      {/* roll arm */}
      <rect x="104" y="44" width="18" height="104" rx="9" fill={`url(#${id}-body)`} />
      <rect x="92" y="132" width="30" height="16" rx="8" fill={finish.shade} />

      {/* camera head */}
      <rect x="34" y="32" width="70" height="70" rx="22" fill={`url(#${id}-body)`} />
      <circle cx="69" cy="67" r="25" fill="#0d0d0d" />
      <circle cx="69" cy="67" r="20" fill="none" stroke="#2a2a2a" strokeWidth="2" />
      <circle cx="69" cy="67" r="15.5" fill={`url(#${id}-glass)`} />
      <ellipse cx="63" cy="60" rx="4.5" ry="3" fill="#fff" fillOpacity="0.5" />

      {/* tilt motor */}
      <circle cx="113" cy="67" r="11" fill={finish.shade} />
      <circle cx="113" cy="67" r="4" fill={finish.light} fillOpacity="0.5" />
    </svg>
  );
}
