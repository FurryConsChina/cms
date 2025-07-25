import { z } from "zod";

export enum FeatureCategory {
  Event = "event",
  Ability = "ability",
  Facility = "facility",
}

export const FeatureCategoryLabel = {
  [FeatureCategory.Event]: "特色活动",
  [FeatureCategory.Ability]: "服务",
  [FeatureCategory.Facility]: "设施",
};

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string().max(256),
  category: z.string().max(256),
  description: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const CreateFeatureSchema = FeatureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const EditableFeatureSchema = FeatureSchema.omit({
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type FeatureType = z.infer<typeof FeatureSchema>;
export type CrateFeatureType = z.infer<typeof CreateFeatureSchema>;
export type EditableFeatureType = z.infer<typeof EditableFeatureSchema>;
