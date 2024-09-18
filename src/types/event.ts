import { OrganizationSchema } from "@/types/organization";
import z from "zod";

/** Sync with https://schema.org/EventStatusType */
export const EventStatus = {
  /** 活动已取消。 */
  EventCancelled: "cancelled",
  /** 活动已从现场参加转为线上参加。 */
  EventMovedOnline: "movedOnline",
  /** 活动已推迟到未来的某个日期，但具体日期未知。 */
  EventPostponed: "postponed",
  /** 活动已重新安排到未来的某个日期。 */
  EventRescheduled: "rescheduled",
  /** 活动按计划举办。 */
  EventScheduled: "scheduled",
};

export type EventStatusKeyType = keyof typeof EventStatus;

export const EventStatusSchema = {
  [EventStatus.EventCancelled]: "https://schema.org/EventCancelled",
  [EventStatus.EventMovedOnline]: "https://schema.org/EventMovedOnline",
  [EventStatus.EventPostponed]: "https://schema.org/EventPostponed",
  [EventStatus.EventRescheduled]: "https://schema.org/EventRescheduled",
  [EventStatus.EventScheduled]: "https://schema.org/EventScheduled",
};

export const EventScale = {
  /** 小型聚会，个人举办的展会一般用这个。 */
  Cosy: "cosy",
  /** 二三线城市的展会一般用这个。 */
  Small: "small",
  /** 一线城市的展会一般用这个，比如：极兽聚 */
  Medium: "medium",
  /** 没有这种规模 */
  Large: "large",
  /** 没有这种规模 */
  Mega: "mega",
};

export type EventScaleKeyType = keyof typeof EventScale;

export const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startAt: z.string().datetime().nullable(),
  endAt: z.string().datetime().nullable(),
  status: z.string(),
  scale: z.string(),
  source: z.string().nullable(),
  address: z.string().nullable(),
  addressLat: z.string().nullable(),
  addressLon: z.string().nullable(),
  addressExtra: z
    .object({ city: z.string().nullable(), citySlug: z.string().nullable() })
    .nullable(),
  thumbnail: z.string().nullable(),
  poster: z
    .object({
      all: z.array(z.string()).nullable(),
    })
    .nullable(),
  detail: z.string().nullable(),
  features: z.object({}).nullable(),

  organization: OrganizationSchema,
});

export const EditableEventSchema = EventSchema.omit({
  id: true,
  organization: true,
}).merge(
  z.object({
    id: z.string().optional(),
    organizations: z.array(
      z.object({
        id: z.string(),
        isPrimary: z.boolean(),
      })
    ),
  })
);

export type EventType = z.infer<typeof EventSchema>;
export type EditableEventType = z.infer<typeof EditableEventSchema>;
