import Axios from "@/api";
import { singleMediaBindingSchema } from "./mediaSchema";
import { getMediaUsages } from "./upload";
import { InferZodType } from "@/types/common";
import { Organization, OrganizationStatus, OrganizationType } from "@/types/organization";
import { List } from "@/types/Request";
import { z } from "zod";
import { contactLinkTypeSchema } from "@/types/contactLink";

export const EditOrganizationApiBody = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().nullish(),
  status: z.enum(OrganizationStatus),
  type: z.enum(OrganizationType).nullish(),
  logo: singleMediaBindingSchema,
  contactMail: z.email().nullish(),
  links: z
    .array(
      z.object({
        type: contactLinkTypeSchema,
        label: z.string().max(256).nullish(),
        value: z.string().min(1),
      }),
    )
    .optional(),
  foundedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
});

export const CreateOrganizationApiBody = EditOrganizationApiBody.extend({
  slug: EditOrganizationApiBody.shape.slug.regex(
    /^[a-z0-9-]+$/,
    "只能使用小写英文字母、数字和连字符 -",
  ),
});

export class OrganizationAPI {
  static async getOrganizationList(params: {
    pageSize: number;
    current: number;
    name?: string;
    slug?: string;
  }) {
    const res = await Axios.get<List<Organization>>("/cms/organization/list", {
      params,
    });

    return res.data;
  }

  static async getOrganizationDetail(params: { id: string }) {
    const res = await Axios.get<Organization>(`/cms/organization/${params.id}`);

    const usages = await getMediaUsages({ entityType: "organization", entityId: params.id });
    return { ...res.data, logo: usages.find((item) => item.role === "logo") ?? null };
  }

  static async createOrganization(organization: InferZodType<typeof CreateOrganizationApiBody>) {
    const res = await Axios.post<Organization>("/cms/organization", organization);

    return res.data;
  }

  static async updateOrganization(
    id: string,
    organization: InferZodType<typeof EditOrganizationApiBody>,
  ) {
    const res = await Axios.patch<Organization>(`/cms/organization/${id}`, organization);

    return res.data;
  }

  static async deleteOrganization(id: string) {
    const res = await Axios.delete<{ success: boolean }>(`/cms/organization/${id}`);

    return res.data;
  }
}
