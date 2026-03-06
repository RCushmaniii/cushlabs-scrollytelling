import { defineCollection, z } from "astro:content";

const sections = defineCollection({
  type: "content",
  schema: z.object({
    order: z.number(),
    id: z.string(),
    type: z.enum(["hero", "content"]).default("content"),
    number: z.string().optional(),
    backgroundImage: z.string().optional(),
    background: z.string().optional(),
    title: z.record(z.string(), z.string()).optional(),
    subtitle: z.record(z.string(), z.string()).optional(),
  }),
});

export const collections = { sections };
