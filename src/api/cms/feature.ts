import Axios from "@/api";
import { InferZodType } from "@/types/common";
import type { Feature, FeatureEvent } from "@/types/feature";
import type { List } from "@/types/request";
import { z } from "zod";

export const EditFeatureApiBody = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().nullish(),
});

export class FeatureAPI {
  static async getFeatureList(params: {
    pageSize: number;
    current: number;
    name?: string;
    category?: string;
    isPublic?: boolean;
  }) {
    const res = await Axios.get<List<Feature>>("/cms/event/feature", {
      params,
    });

    return res.data;
  }

  static async getFeatureEvents(id: string, params: { pageSize: number; current: number }) {
    const res = await Axios.get<List<FeatureEvent>>(`/cms/event/feature/${id}/events`, {
      params,
    });

    return res.data;
  }

  static async deleteFeature(id: string) {
    return (await Axios.delete(`/cms/event/feature/${id}`)).data;
  }

  static async createFeature(feature: InferZodType<typeof EditFeatureApiBody>) {
    const res = await Axios.post<Feature>("/cms/event/feature", feature);

    return res.data;
  }

  static async updateFeature(id: string, feature: InferZodType<typeof EditFeatureApiBody>) {
    const res = await Axios.post<Feature>(`/cms/event/feature/${id}`, feature);

    return res.data;
  }
}
