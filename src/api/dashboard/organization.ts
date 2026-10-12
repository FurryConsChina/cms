import Axios from "@/api";
import useAuthStore from "@/stores/auth";
import { UserRole } from "@/types/User";
import { singleMediaBindingSchema } from "./mediaSchema";
import { getMediaUsages } from "./upload";
import { InferZodType } from "@/types/common";
import { Organization, OrganizationStatus, OrganizationType } from "@/types/organization";
import { List } from "@/types/Request";
import { z } from "zod";

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
      z.object({ type: z.string().min(1).max(64), label: z.string().max(256).nullish(), value: z.string().min(1) }),
    )
    .optional(),
  foundedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
});

export class OrganizationAPI {
  static async getOrganizationList(params: { pageSize: number; current: number; name?: string; slug?: string }) {
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

  static async createOrganization(organization: InferZodType<typeof EditOrganizationApiBody>) {
    const isAdmin = useAuthStore.getState().user?.role === UserRole.Admin;
    const { logo, ...attributes } = organization;
    if (logo) throw new Error("请先保存组织，再编辑标志");
    const body = isAdmin
      ? attributes
      : {
          slug: organization.slug,
          name: organization.name,
          description: organization.description,
          type: organization.type,
          contactMail: organization.contactMail,
          links: organization.links,
        };
    const res = await Axios.post<Organization>(isAdmin ? "/cms/organization" : "/cms/organization/owned", body);

    return res.data;
  }

  static async updateOrganization(id: string, organization: InferZodType<typeof EditOrganizationApiBody>) {
    const res = await Axios.patch<Organization>(`/cms/organization/${id}`, organization);

    return res.data;
  }

  static async deleteOrganization(id: string) {
    const res = await Axios.delete<{ success: boolean }>(`/cms/organization/${id}`);

    return res.data;
  }
}
