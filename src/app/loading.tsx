/**
 * Route-level loading UI. Next wraps the page in <Suspense> with this as the
 * fallback, so there is no isLoading state anywhere in the app.
 */
export default function Loading() {
  return (
    <div className="grid min-h-svh place-items-center bg-ink" aria-busy="true">
      <div className="focus-brackets grid h-44 w-72 place-items-center">
        <p className="font-mono text-xs tracking-[0.24em] text-focus uppercase">
          <span className="rec-blink">Focusing</span>
        </p>
      </div>
      <span className="sr-only">Loading GX1</span>
    </div>
  );
}
