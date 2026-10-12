import Axios from "@/api";
import { z } from "zod";
import type { List, PageQuery } from "@/types/Request";
import type { Feedback, FeedbackCategory, FeedbackDetail, FeedbackStatus } from "@/types/feedback";

export const feedbackUpdateSchema = z
  .object({
    status: z.enum(["new", "processing", "resolved", "closed", "spam"]),
    internalNote: z.string().max(2000).nullish(),
  })
  .refine((v) => !["closed", "spam"].includes(v.status) || !!v.internalNote?.trim(), {
    message: "关闭或标记垃圾反馈时请填写原因",
    path: ["internalNote"],
  });

export class FeedbackAPI {
  static async list(
    params: PageQuery & {
      status?: FeedbackStatus | "all";
      category?: FeedbackCategory;
      pagePath?: string;
      createdFrom?: string;
      createdTo?: string;
    },
  ) {
    return (await Axios.get<List<Feedback>>("/cms/feedback", { params })).data;
  }

  static async detail(id: string) {
    return (await Axios.get<FeedbackDetail>(`/cms/feedback/${id}`)).data;
  }

  static async update(id: string, input: z.infer<typeof feedbackUpdateSchema>) {
    return (await Axios.patch<FeedbackDetail>(`/cms/feedback/${id}`, input)).data;
  }
}
