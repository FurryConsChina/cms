import Axios from "@/api";
import { InferZodType } from "@/types/common";
import { Organization, OrganizationStatus, OrganizationType } from "@/types/organization";
import { List } from "@/types/Request";
import { z } from "zod";

export const EditOrganizationApiBody = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  status: z.enum(OrganizationStatus),
  type: z.enum(OrganizationType),
  logoUrl: z.string().nullish(),
  richMediaConfig: z.any().nullish(),
  contactMail: z.email().nullish(),
  website: z.url().nullish(),
  twitter: z.url().nullish(),
  weibo: z.url().nullish(),
  qqGroup: z.string().nullish(),
  bilibili: z.url().nullish(),
  rednote: z.url().nullish(),
  wikifur: z.url().nullish(),
  facebook: z.url().nullish(),
  plurk: z.url().nullish(),
  extraMedia: z
    .object({
      qqGroups: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
    })
    .nullish(),
  creationTime: z.iso.datetime().nullish(),
});

export class OrganizationAPI {
  static async getOrganizationList(params: { pageSize: number; current: number; name?: string; slug?: string }) {
    const res = await Axios.get<List<Organization>>("/internal/cms/organization/list", {
      params,
    });

    return res.data;
  }

  static async getOrganizationDetail(params: { id: string }) {
    const res = await Axios.get<Organization>(`/internal/cms/organization/${params.id}`);

    return res.data;
  }

  static async createOrganization(organization: InferZodType<typeof EditOrganizationApiBody>) {
    const res = await Axios.post<Organization>("/internal/cms/organization", {
      organization,
    });

    return res.data;
  }

  static async updateOrganization(id: string, organization: InferZodType<typeof EditOrganizationApiBody>) {
    const res = await Axios.post<Organization>(`/internal/cms/organization/${id}`, organization);

    return res.data;
  }

  static async deleteOrganization(id: string) {
    const res = await Axios.delete<{ success: boolean }>(`/internal/cms/organization/${id}`);

    return res.data;
  }
}
