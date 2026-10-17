import Axios from "@/api";
import {
  EventScale,
  EventStatus,
  EventLocationType,
  EventTicketChannelType,
  EventType,
  type EditableEvent,
} from "@/types/event";
import type { List, PageQuery } from "@/types/Request";
import z from "zod";
import { getMediaUsages } from "./upload";
import type { EventResponse } from "@/types/event";
import { toEventItem } from "./eventAdapter";

import { mediaBindingSchema, singleMediaBindingSchema } from "./mediaSchema";

export const EditEventApiBody = z.object({
  name: z.string().min(1).max(256),
  startAt: z.iso.datetime().nullish(),
  endAt: z.iso.datetime().nullish(),
  status: z.enum(EventStatus),
  scale: z.enum(EventScale),
  type: z.enum(EventType).optional(),
  locationType: z.enum(EventLocationType).optional(),
  organizations: z.array(
    z.object({
      id: z.uuid(),
      isPrimary: z.boolean(),
    }),
  ),
  regionId: z.uuid().nullish(),
  placeId: z.uuid().nullish(),
  locationNotes: z.string().nullish(),
  sources: z
    .array(
      z.object({
        url: z.string(),
        name: z.string().nullish(),
        description: z.string().nullish(),
      }),
    )
    .nullish(),
  ticketChannels: z
    .array(
      z.object({
        type: z.enum(EventTicketChannelType),
        name: z.string(),
        url: z.string(),
        available: z.boolean(),
      }),
    )
    .nullish(),

  cover: singleMediaBindingSchema,
  poster: z.array(mediaBindingSchema).nullish(),
  gallery: z.array(mediaBindingSchema).nullish(),
  videos: z.array(mediaBindingSchema).nullish(),
  lives: z.array(mediaBindingSchema).nullish(),
  detail: z.string().nullish(),
  features: z.array(z.union([z.object({ id: z.uuid() }), z.object({ name: z.string().min(1).max(256) })])).nullish(),
  extra: z
    .object({
      overrideOrganizationContact: z
        .object({
          qqGroups: z.array(z.object({ label: z.string().nullish(), value: z.string() })).optional(),
        })
        .optional(),
    })
    .optional(),
});

export interface EventListQuery extends PageQuery {
  search?: string;
  orgSearch?: string;
  regionSlug?: string[];
  regionName?: string;
  placeName?: string;
  placeAddress?: string;
}

export class EventAPI {
  static async getEventList(params: EventListQuery) {
    const res = await Axios.get<List<EventResponse>>("/cms/event/list", {
      params,
    });

    return { ...res.data, records: res.data.records.map((event) => toEventItem(event)) };
  }

  static async getEventDetail(params: { id: string }) {
    const res = await Axios.get<EventResponse>(`/cms/event/detail/${params.id}`);

    if (!res.data) throw new Error("展会不存在或已被删除");
    const usages = await getMediaUsages({ entityType: "event", entityId: params.id });
    return toEventItem(res.data, usages);
  }

  static async createEvent(event: EditableEvent) {
    const { cover, poster, gallery, videos, lives, ...attributes } = event;
    if (cover || poster?.length || gallery?.length || videos?.length || lives?.length) {
      throw new Error("请先保存活动，再编辑媒体资源");
    }
    const res = await Axios.post<{ id: string }>("/cms/event", {
      event: attributes,
    });

    return res.data;
  }

  static async updateEvent(eventId: string, event: EditableEvent) {
    const res = await Axios.patch<EventResponse>(`/cms/event/${eventId}`, { event });

    return res.data;
  }

  static async setVisibility(id: string, input: { isPublished?: boolean; isSuspended?: boolean }) {
    return (await Axios.patch<EventResponse>(`/cms/event/${id}/visibility`, input)).data;
  }

  static async deleteEvent(id: string) {
    const res = await Axios.delete<{ success: boolean }>(`/cms/event/${id}`);

    return res.data;
  }
}
