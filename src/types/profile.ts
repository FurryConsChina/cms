import type { MediaBinding } from "./media";

export type LinkItem = { type: string; label?: string | null; value: string };

export type Profile = {
  id: string;
  name: string;
  slug: string;
  kind: "individual" | "group" | "brand" | "media";
  status: "active" | "inactive";
  description: string | null;
  contactMail: string | null;
  avatarUrl: string | null;
  links: LinkItem[];
  avatar?: MediaBinding | null;
  portrait?: MediaBinding[];
  gallery?: MediaBinding[];
};
