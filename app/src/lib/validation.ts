import { z } from "zod";

export const onboardingSchema = z.object({
  name: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(60, "Nama maksimal 60 karakter")
    .regex(/^[A-Za-z\s'.-]+$/, "Nama hanya huruf, spasi, titik, petik, strip"),
  class: z.enum(["VIII-A", "VIII-B", "VIII-C", "VIII-D"]),
  absen: z.coerce.number().int().min(1).max(40),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

export const reasoningSchema = z.object({
  reasoning: z.string().min(20, "Penalaran minimal 20 karakter").max(500),
});

export const assignmentSchema = z.record(
  z.enum(["A", "B", "C", "D", "E", "F"]),
  z.string().min(1),
);
