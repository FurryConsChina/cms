import Axios from "@/api";
import type { InferZodType } from "@/types/common";
import type { List } from "@/types/request";
import type { Application } from "@/types/application";
import { EditApplicationApiBody } from "../application";

export class AdminApplicationApi {
  static async getApplicationList(current = 1, pageSize = 20) {
    const res = await Axios.get<List<Application>>("/cms/admin/application", {
      params: { current, pageSize },
    });
    return res.data;
  }

  static async getApplicationDetail(id: string) {
    const res = await Axios.get<Application>(`/cms/admin/application/${id}`);
    return res.data;
  }

  static async createApplication(application: InferZodType<typeof EditApplicationApiBody>) {
    const res = await Axios.post<Application>("/cms/admin/application", application);
    return res.data;
  }

  static async updateApplication(
    id: string,
    application: InferZodType<typeof EditApplicationApiBody>,
  ) {
    const res = await Axios.post<Application>(`/cms/admin/application/${id}`, application);
    return res.data;
  }

  static async deleteApplication(id: string) {
    const res = await Axios.delete<{ success: boolean }>(`/cms/admin/application/${id}`);
    return res.data;
  }
}
