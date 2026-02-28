import { z } from "zod";

export const PlantSchema = z.object({
  identified: z.boolean(),
  not_a_plant: z.boolean(),
  confidence: z.enum(["high", "medium", "low"]),
  name: z.object({
    common: z.string(),
    scientific: z.string(),
    family: z.string(),
  }),
  description: z.string(),
  toxicity: z.object({
    is_toxic: z.boolean(),
    toxic_to: z.array(z.string()),
    dangerous_parts: z.array(z.string()),
    symptoms: z.array(z.string()),
    severity: z.enum(["none", "mild", "moderate", "severe", "fatal"]),
  }),
  edibility: z.object({
    is_edible: z.boolean(),
    edible_parts: z.array(z.string()),
    preparation: z.string(),
    warnings: z.array(z.string()),
  }),
});

export type Plant = z.infer<typeof PlantSchema>;
