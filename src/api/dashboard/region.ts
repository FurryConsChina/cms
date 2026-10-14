import Axios from "@/api";
import { InferZodType } from "@/types/common";
import { RegionType, type Region } from "@/types/region";
import type { List } from "@/types/Request";
import { z } from "zod";

export const EditRegionApiBody = z.object({
  name: z.string().min(1).max(256),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9-]+$/),
  kind: z.enum(RegionType),
  parentId: z.uuid().nullish(),
  localName: z.string().max(256).nullish(),
});

export class RegionAPI {
  static async getRegionList(params: {
    pageSize: number;
    current: number;
    search?: string;
    code?: string;
    name?: string;
  }) {
    const res = await Axios.get<List<Region>>("/cms/region", {
      params,
    });

    return res.data;
  }

  static async createRegion(region: InferZodType<typeof EditRegionApiBody>) {
    const res = await Axios.post<Region>("/cms/region", {
      region,
    });

    return res.data;
  }

  static async updateRegion(id: string, region: InferZodType<typeof EditRegionApiBody>) {
    const res = await Axios.post<Region>(`/cms/region/${id}`, {
      region,
    });

    return res.data;
  }

  static async getRegion(id: string) {
    const res = await Axios.get<Region | null>(`/cms/region/${id}`);
    if (!res.data) throw new Error("地区不存在或已被删除");

    return res.data;
  }

  static async deleteRegion(id: string) {
    const res = await Axios.delete<boolean>(`/cms/region/${id}`);

    return res.data;
  }
}
