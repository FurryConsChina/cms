import Axios from "@/api";
import {
  EventLocationType,
  EventTicketChannelType,
  EventType,
  type EditableEvent,
  type EventItem,
} from "@/types/event";
import type { List } from "@/types/Request";
import z from "zod";

export const EditEventApiBody = z.object({
  name: z.string(),
  slug: z.string(),
  startAt: z.iso.datetime().nullish(),
  endAt: z.iso.datetime().nullish(),
  status: z.string(),
  scale: z.string(),
  type: z.enum(EventType).optional(),
  locationType: z.enum(EventLocationType).optional(),
  organizations: z.array(
    z.object({
      id: z.uuid(),
      isPrimary: z.boolean(),
    }),
  ),
  regionId: z.uuid().optional(),
  address: z.string().nullish(),
  addressLat: z.string().nullish(),
  addressLon: z.string().nullish(),
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

  thumbnail: z.string().optional(),
  media: z
    .object({
      images: z
        .array(
          z.object({
            url: z.string(),
            title: z.string().nullish(),
            description: z.string().nullish(),
          }),
        )
        .optional(),
      videos: z
        .array(
          z.object({
            url: z.string(),
            title: z.string().nullish(),
            description: z.string().nullish(),
          }),
        )
        .optional(),
      lives: z
        .array(
          z.object({
            url: z.string(),
            title: z.string().nullish(),
            description: z.string().nullish(),
          }),
        )
        .optional(),
    })
    .optional(),
  detail: z.string().nullish(),
  features: z
    .object({
      self: z.array(z.string()).optional(),
    })
    .nullish(),
  featureIds: z.array(z.string()).nullish(),
  extra: z
    .object({
      overrideOrganizationContact: z
        .object({
          qqGroups: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
        })
        .optional(),
    })
    .optional(),
});

export class EventAPI {
  static async getEventList(params: { pageSize: number; current: number; search?: string; orgSearch?: string }) {
    const res = await Axios.get<List<EventItem>>("/internal/cms/event/list", {
      params,
    });

    return res.data;
  }

  static async getEventDetail(params: { id: string }) {
    const res = await Axios.get<EventItem>(`/internal/cms/event/detail/${params.id}`);

    return res.data;
  }

  static async createEvent(event: EditableEvent) {
    const res = await Axios.post<EventItem>("/internal/cms/event", {
      event,
    });

    return res.data;
  }

  static async updateEvent(eventId: string, event: EditableEvent) {
    const res = await Axios.post<EventItem>(`/internal/cms/event/${eventId}`, {
      event,
    });

    return res.data;
  }

  static async deleteEvent(id: string) {
    const res = await Axios.delete<{ success: boolean }>(`/internal/cms/event/${id}`);

    return res.data;
  }
}
