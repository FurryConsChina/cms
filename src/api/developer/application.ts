import Axios from "@/api";
import { InferZodType } from "@/types/common";
import { List } from "@/types/Request";
import { Application } from "@/types/application";
import { z } from "zod";

export const EditApplicationApiBody = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
});

export class ApplicationApi {
  static async getApplicationList(params?: { pageSize?: number; current?: number; search?: string; orgSearch?: string }) {
    const res = await Axios.get<List<Application>>("/developer/application", {
      params,
    });
    return res.data;
  }

  static async getApplicationDetail(id: string) {
    const res = await Axios.get<Application>(`/developer/application/${id}`);
    return res.data;
  }

  static async createApplication(application: InferZodType<typeof EditApplicationApiBody>) {
    const res = await Axios.post<Application>("/developer/application", application);
    return res.data;
  }

  static async updateApplication(id: string, application: InferZodType<typeof EditApplicationApiBody>) {
    const res = await Axios.post<Application>(`/developer/application/${id}`, application);
    return res.data;
  }

  static async deleteApplication(id: string) {
    const res = await Axios.delete<{ success: boolean }>(`/developer/application/${id}`);
    return res.data;
  }
}
