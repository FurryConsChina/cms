import Axios from "@/api";
import { z } from "zod";
import type { List, PageQuery } from "@/types/request";
import type { Participant } from "@/types/participant";
import { getMediaUsages } from "./upload";
import { mediaBindingSchema } from "./mediaSchema";

export const participantSchema = z
  .object({
    eventId: z.uuid(),
    profileId: z.uuid().nullish(),
    organizationId: z.uuid().nullish(),
    role: z.enum(["guest", "exhibitor", "sponsor", "media"]),
    description: z.string().nullish(),
    booth: z.string().max(64).nullish(),
    tier: z.string().max(64).nullish(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().min(0),
    appearanceDates: z.array(z.iso.date()).nullish(),
    portrait: z.array(mediaBindingSchema).optional(),
    gallery: z.array(mediaBindingSchema).optional(),
  })
  .refine((v) => Boolean(v.profileId) !== Boolean(v.organizationId), {
    message: "请选择参加的主体资料或组织",
    path: ["profileId"],
  });

export type ParticipantInput = z.infer<typeof participantSchema>;

/** 不传 portrait / gallery 时，后端保留原有媒体。 */
export const toParticipantInput = (v: Participant): ParticipantInput => ({
  eventId: v.eventId,
  profileId: v.profileId,
  organizationId: v.organizationId,
  role: v.role,
  description: v.description,
  booth: v.booth,
  tier: v.tier,
  isFeatured: v.isFeatured,
  sortOrder: v.sortOrder,
  appearanceDates: v.appearanceDates,
});

export class ParticipantAPI {
  static async list(params: PageQuery & { eventId?: string; role?: Participant["role"] }) {
    return (await Axios.get<List<Participant>>("/cms/participant", { params })).data;
  }

  static async detail(record: Participant): Promise<Participant> {
    const media = await getMediaUsages({ entityType: "event_participation", entityId: record.id });
    return {
      ...record,
      portrait: media.filter((v) => v.role === "portrait"),
      gallery: media.filter((v) => v.role === "gallery"),
    };
  }

  static async save(id: string | undefined, participant: ParticipantInput) {
    return (
      await Axios.post<Participant>(id ? `/cms/participant/${id}` : "/cms/participant", {
        participant,
      })
    ).data;
  }

  static async updateOwn(id: string, description: string | null) {
    return (
      await Axios.patch<Participant>(`/cms/participant/${id}`, { participant: { description } })
    ).data;
  }

  static async delete(id: string) {
    return (await Axios.delete(`/cms/participant/${id}`)).data;
  }
}
