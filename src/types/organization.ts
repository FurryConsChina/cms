import { z } from "zod";

export const OrganizationStatus = {
  Active: "active",
  InActive: "inactive",
};

export const OrganizationType = {
  Personal: "personal",
  Agency: "agency",
};

export const OrganizationStatusLabel = {
  [OrganizationStatus.Active]: "正常运营",
  [OrganizationStatus.InActive]: "终止活动",
};

export const OrganizationTypeLabel = {
  [OrganizationType.Personal]: "个人",
  [OrganizationType.Agency]: "团体",
};

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  status: z.enum(["active", "inactive"]),
  type: z.enum(["personal", "agency"]).nullish(),
  logoUrl: z.string().nullish(),
  contactMail: z.string().nullish(),
  links: z
    .array(z.object({ type: z.string(), label: z.string().nullish(), value: z.string() }))
    .optional(),
  foundedOn: z.string().nullish(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
