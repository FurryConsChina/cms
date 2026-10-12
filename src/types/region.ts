import { z } from "zod";

export enum RegionType {
  COUNTRY = "country",
  STATE = "administrative_area",
  CITY = "city",
  DISTRICT = "district",
}
export const RegionTypeLabel = {
  [RegionType.COUNTRY]: "国家",
  [RegionType.STATE]: "行政区",
  [RegionType.CITY]: "城市",
  [RegionType.DISTRICT]: "区县",
};
const regionFields = {
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  kind: z.enum(RegionType),
  parentId: z.uuid().nullish(),
  localName: z.string().nullish(),
  timezone: z.string().nullish(),
  isoCode: z.string().nullish(),
  displayOrder: z.number(),
  heatScore: z.number().optional(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  deletedAt: z.string().nullish(),
};
export const RegionSchema = z.object({ ...regionFields, parent: z.object(regionFields).nullish() });
export type Region = z.infer<typeof RegionSchema>;
