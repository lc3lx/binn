import { z } from "zod";

export const createFaqSchema = z.object({
  question: z.string().trim().min(3, "Question is required"),
  answer: z.string().trim().min(3, "Answer is required"),
  isActive: z.boolean().default(true),
});

export const editFaqSchema = z.object({
  isActive: z.boolean(),
});
