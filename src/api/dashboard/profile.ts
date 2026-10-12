import Axios from "@/api";
import { z } from "zod";
import type { List, PageQuery } from "@/types/Request";
import type { Profile } from "@/types/profile";
import { getMediaUsages } from "./upload";
import { mediaBindingSchema, singleMediaBindingSchema } from "./mediaSchema";

export const linkSchema = z.object({
  type: z.string().min(1).max(64),
  label: z.string().max(256).nullish(),
  value: z.string().min(1),
});

export const profileSchema = z.object({
  slug: z
    .string()
    .min(2, "标识至少需要两个字符")
    .max(64)
    .regex(/^[a-zA-Z0-9-]+$/, "标识只能包含字母、数字和连字符"),
  name: z.string().min(1, "请填写名称").max(256),
  kind: z.enum(["individual", "group", "brand", "media"]),
  status: z.enum(["active", "inactive"]),
  description: z.string().nullish(),
  contactMail: z.email("联系邮箱格式不正确").nullish(),
  links: z.array(linkSchema).optional(),
  avatar: singleMediaBindingSchema,
  portrait: z.array(mediaBindingSchema).nullish(),
  gallery: z.array(mediaBindingSchema).nullish(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export class ProfileAPI {
  static async list(params: PageQuery & { name?: string; kind?: Profile["kind"] }) {
    return (await Axios.get<List<Profile>>("/cms/profile", { params })).data;
  }

  static async detail(id: string): Promise<Profile> {
    const record = (await Axios.get<Profile>(`/cms/profile/${id}`)).data;
    const media = await getMediaUsages({ entityType: "profile", entityId: id });
    return {
      ...record,
      avatar: media.find((v) => v.role === "avatar") ?? null,
      portrait: media.filter((v) => v.role === "portrait"),
      gallery: media.filter((v) => v.role === "gallery"),
    };
  }

  /** 新建接口不接受媒体字段，媒体在记录保存后再绑定。 */
  static async create(data: ProfileInput, platform: boolean) {
    const { avatar: _avatar, portrait: _portrait, gallery: _gallery, ...attributes } = data;
    const { slug, name, kind, description, contactMail, links } = data;
    return (
      await Axios.post<Profile>(
        platform ? "/cms/profile" : "/cms/profile/owned",
        platform ? attributes : { slug, name, kind, description, contactMail, links },
      )
    ).data;
  }

  static async update(id: string, data: ProfileInput) {
    return (await Axios.patch<Profile>(`/cms/profile/${id}`, data)).data;
  }

  static async delete(id: string) {
    return (await Axios.delete(`/cms/profile/${id}`)).data;
  }
}
