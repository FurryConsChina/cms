import { z } from "zod";

export const ApplicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  permission: z.object({
    read: z.boolean(),
    write: z.boolean(),
  }),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  disabledAt: z.string().nullable(),
});

export type Application = z.infer<typeof ApplicationSchema>;
