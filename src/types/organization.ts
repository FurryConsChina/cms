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
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  type: z.enum(["personal", "agency"]).optional(),
  logoUrl: z.string().optional(),
  richMediaConfig: z.any().optional(),
  contactMail: z.string().email().optional(),
  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
  weibo: z.string().url().optional(),
  qqGroup: z.string().optional(),
  bilibili: z.string().url().optional(),
  rednote: z.string().url().optional(),
  wikifur: z.string().url().optional(),
  facebook: z.string().url().optional(),
  plurk: z.string().url().optional(),
  extraMedia: z
    .object({
      qqGroups: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
  creationTime: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

export const EditableOrganizationSchema = OrganizationSchema.extend({
  id: z.string().uuid().nullish(),
});

export type EditableOrganizationType = z.infer<
  typeof EditableOrganizationSchema
>;
