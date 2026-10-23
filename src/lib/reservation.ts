import { z } from "zod";
import { finishIds, kitIds } from "@/lib/catalog";

export const reservationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email to hold a GX1.")
    .email("That email doesn't look right. Check for typos."),
  finish: z.enum(finishIds, { message: "Pick a finish first." }),
  kit: z.enum(kitIds, { message: "Pick a kit first." }),
  country: z.string().length(2).default("US"),
});

export type ReservationState =
  | { status: "idle" }
  | { status: "error"; message: string; fields?: Record<string, string> }
  | {
      status: "reserved";
      code: string;
      email: string;
      finish: string;
      kit: string;
    };
