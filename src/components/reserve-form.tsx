"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { reserve } from "@/app/actions";
import type { ReservationState } from "@/lib/reservation";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

const initial: ReservationState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="absolute top-1.5 right-1.5 z-20 flex h-11 items-center gap-2 rounded-full bg-rec px-5 font-display text-lg font-semibold tracking-[0.1em] text-hud uppercase transition-[background-color,opacity] duration-200 hover:bg-[#ff4747] disabled:cursor-progress disabled:opacity-80"
    >
      <span
        aria-hidden="true"
        className={pending ? "rec-blink h-2.5 w-2.5 rounded-full bg-hud" : "h-2.5 w-2.5 rounded-full bg-hud"}
      />
      {pending ? "Holding…" : "Reserve"}
    </button>
  );
}

/**
 * The only client code in the configurator. Finish, kit and country arrive as
 * props from the server and travel back as hidden fields; the Server Action
 * validates all of it with zod.
 */
export function ReserveForm({
  finish,
  kit,
  country,
}: {
  finish: string;
  kit: string;
  country: string;
}) {
  const [state, action] = useActionState(reserve, initial);
  const emailError = state.status === "error" ? state.fields?.email : undefined;

  return (
    <form action={action} noValidate className="w-full">
      <input type="hidden" name="finish" value={finish} />
      <input type="hidden" name="kit" value={kit} />
      <input type="hidden" name="country" value={country} />

      <div className="relative">
        <PlaceholdersAndVanishInput
          name="email"
          label="Email address"
          placeholders={[
            "you@studio.com",
            "Where should we send your reservation?",
            "No payment today. Just an email.",
          ]}
          vanishKey={state.status === "reserved" ? state.code : undefined}
          invalid={Boolean(emailError)}
          describedBy="reserve-status"
        />
        <SubmitButton />
      </div>

      <div id="reserve-status" aria-live="polite" className="mt-3 min-h-12 text-sm">
        {state.status === "error" && <p className="text-[#ff8a8a]">{state.message}</p>}
        {state.status === "reserved" && (
          <p className="text-hud">
            <span className="font-mono text-focus">{state.code}</span>
            {" · "}
            {state.finish}, {state.kit}, held for {state.email}.{" "}
            <span className="text-hud-dim">
              GX1 is fictional, so nothing was stored or charged.
            </span>
          </p>
        )}
        {state.status === "idle" && (
          <p className="text-hud-dim">No payment today. We email you before anything ships.</p>
        )}
      </div>
    </form>
  );
}
