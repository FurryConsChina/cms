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
  static async getApplicationList(current = 1, pageSize = 20) {
    const res = await Axios.get<List<Application>>("/cms/application", {
      params: { current, pageSize },
    });
    return res.data;
  }

  static async getApplicationDetail(id: string) {
    const res = await Axios.get<Application>(`/cms/application/${id}`);
    return res.data;
  }

  static async createApplication(application: InferZodType<typeof EditApplicationApiBody>) {
    const res = await Axios.post<Application>("/cms/application", application);
    return res.data;
  }

  static async updateApplication(id: string, application: InferZodType<typeof EditApplicationApiBody>) {
    const res = await Axios.post<Application>(`/cms/application/${id}`, application);
    return res.data;
  }

  static async deleteApplication(id: string) {
    const res = await Axios.delete<{ success: boolean }>(`/cms/application/${id}`);
    return res.data;
  }
}
