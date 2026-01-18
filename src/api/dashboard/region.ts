import Axios from "@/api";
import { InferZodType } from "@/types/common";
import { RegionType, type Region } from "@/types/region";
import type { List } from "@/types/Request";
import { z } from "zod";

export const EditRegionApiBody = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  type: z.enum(RegionType),
  level: z.number(),
  parentId: z.uuid().nullish(),
  countryCode: z.string().nullish(),
  isOverseas: z.boolean(),
  addressFormat: z.string().nullish(),
  localName: z.string().nullish(),
  timezone: z.string().nullish(),
  languageCode: z.string().nullish(),
  currencyCode: z.string().nullish(),
  phoneCode: z.string().nullish(),
  isoCode: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  sortOrder: z.number().nullish(),
  remark: z.string().nullish(),
});

export class RegionAPI {
  static async getRegionList(params: { pageSize: number; current: number; code?: string }) {
    const res = await Axios.get<List<Region>>("/internal/cms/region", {
      params,
    });

    return res.data;
  }

  static async createRegion(region: InferZodType<typeof EditRegionApiBody>) {
    const res = await Axios.post<Region>("/internal/cms/region", {
      region,
    });

    return res.data;
  }

  static async updateRegion(id: string, region: InferZodType<typeof EditRegionApiBody>) {
    const res = await Axios.post<Region>(`/internal/cms/region/${id}`, {
      region,
    });

    return res.data;
  }

  static async getRegion(id: string) {
    const res = await Axios.get<Region>(`/internal/cms/region/${id}`);

    return res.data;
  }

  static async deleteRegion(id: string) {
    const res = await Axios.delete<{
      success: boolean;
    }>(`/internal/cms/region/${id}`);

    return res.data;
  }

  static async recreateRegionOrder(type: RegionType) {
    const res = await Axios.post<{
      success: boolean;
    }>("/internal/cms/region/recreate-order", {
      type,
    });

    return res.data;
  }
}
