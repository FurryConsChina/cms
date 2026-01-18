import { z } from "zod";

export type InferZodType<T extends z.ZodTypeAny> = z.infer<T>;

export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}
