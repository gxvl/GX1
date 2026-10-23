"use server";

import { getFinish, getKit } from "@/lib/catalog";
import { reservationSchema, type ReservationState } from "@/lib/reservation";

/**
 * Reserve a GX1. Validation happens here, on the server, with zod.
 * GX1 is fictional, so nothing is stored or charged; the action returns
 * a reservation code the way a real one would.
 */
export async function reserve(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const parsed = reservationSchema.safeParse({
    email: formData.get("email"),
    finish: formData.get("finish"),
    kit: formData.get("kit"),
    country: formData.get("country") ?? undefined,
  });

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fields[key] ??= issue.message;
    }
    return {
      status: "error",
      message: Object.values(fields)[0] ?? "Something is missing.",
      fields,
    };
  }

  // Simulate the round trip a payment provider would add.
  await new Promise((r) => setTimeout(r, 650));

  const { email, finish, kit, country } = parsed.data;
  const code = `GX1-${country}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

  return {
    status: "reserved",
    code,
    email,
    finish: getFinish(finish).name,
    kit: getKit(kit).name,
  };
}
