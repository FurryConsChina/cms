import { z } from "zod";

// Link types preserved by the Moon → Luna migration. Email uses contactMail.
export const CONTACT_LINK_TYPES = [
  "website",
  "twitter",
  "weibo",
  "qq_group",
  "bilibili",
  "rednote",
  "wikifur",
  "facebook",
  "plurk",
] as const;

export type ContactLinkType = (typeof CONTACT_LINK_TYPES)[number];

export const contactLinkTypeSchema = z.enum(CONTACT_LINK_TYPES, "请选择支持的链接类型或删除此链接");
