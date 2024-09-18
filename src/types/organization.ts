import { z } from "zod";

export const OrganizationStatus = {
  Active: "active",
  InActive: "inactive",
};

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  status: z.enum(["active", "inactive"]),
  type: z.string().nullish(),
  logoUrl: z.string().nullish(),
  richMediaConfig: z.any().nullish(),
  contactMail: z.string().email().nullish(),
  website: z.string().url().nullish(),
  twitter: z.string().url().nullish(),
  weibo: z.string().url().nullish(),
  qqGroup: z.string().nullish(),
  bilibili: z.string().url().nullish(),
  wikifur: z.string().url().nullish(),
  creationTime: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .nullish(),
});

export type OrganizationType = z.infer<typeof OrganizationSchema>;

export const EditableOrganizationSchema = OrganizationSchema.extend({
  id: z.string().uuid().nullish(),
});

export type EditableOrganizationType = z.infer<
  typeof EditableOrganizationSchema
>;
