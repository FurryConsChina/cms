import Axios from "@/api";
import { InferZodType } from "@/types/common";
import type { Feature } from "@/types/feature";
import type { List } from "@/types/Request";
import { z } from "zod";

export const EditFeatureApiBody = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().nullish(),
});

export class FeatureAPI {
  static async getFeatureList(params: { pageSize: number; current: number; name?: string }) {
    const res = await Axios.get<List<Feature>>("/internal/cms/event/feature", {
      params,
    });

    return res.data;
  }

  static async createFeature(feature: InferZodType<typeof EditFeatureApiBody>) {
    const res = await Axios.post<Feature>("/internal/cms/event/feature", feature);

    return res.data;
  }

  static async updateFeature(id: string, feature: InferZodType<typeof EditFeatureApiBody>) {
    const res = await Axios.post<Feature>(`/internal/cms/event/feature/${id}`, feature);

    return res.data;
  }
}
