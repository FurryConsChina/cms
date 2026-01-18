import { BaseModel, InferZodType } from "@/types/common";
import { Organization } from "@/types/organization";
import { Region } from "@/types/region";
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
  /** 一线城市的展会但是不是很有名一般用这个，比如：上海兽界 */
  Medium: "medium",
  /** 大型展会 */
  Large: "large",
  /** 特大型展会,以极兽聚为代表的超过3000人以上的展会 */
  XLarge: "xlarge",
  /**超特大型展会 */
  XXLarge: "xxlarge",
  /** 巨型展会，没有这种规模 */
  Mega: "mega",
};

export const EventType = {
  /** 有毛又有销售摊位，比如极兽聚夏聚 */
  AllInCon: "all-in-con",
  /** 贩售会，主要在台湾和日本，以卖本子为主 */
  ComicMarket: "comic-market",
  /** 纯吸毛展，比如极兽聚冬聚 */
  SuitOnlyCon: "suit-only-con",
  /** 主打旅游的展子，行程里包含旅游等安排。 */
  TravelCon: "travel-con",
  /** 类似粉丝见面会和同城交友的类型，比如岚兽聚，这种展会的显著特点是：展会主动选择（筛选）访客。 */
  FandomMeetup: "fandom-meetup",
};

export const EventLocationType = {
  /** 在酒店举办的展会 */
  Hotel: "hotel",
  /** 在专用活动场地举办的展会 */
  Venue: "venue",
  /** 线上活动,除了整活不知道为什么会出现这种情况。 */
  Online: "online",
};

export type EventScaleKeyType = keyof typeof EventScale;

export interface IEvent extends BaseModel {
  name: string;
  slug: string;
  startAt: string | null;
  endAt: string | null;
  status: EventStatusKeyType;
  scale: EventScaleKeyType;
  type: (typeof EventType)[keyof typeof EventType];
  locationType: (typeof EventLocationType)[keyof typeof EventLocationType];
  source: string | null;
  sources: {
    url: string;
    name: string | null;
    description: string | null;
  }[];
  ticketChannels: {
    type: "wxMiniProgram" | "url" | "qrcode" | "app";
    name: string;
    url: string;
    available: boolean;
  }[];
  address: string | null;
  addressLat: string | null;
  addressLon: string | null;
  thumbnail: string | null;
  media: {
    images: {
      url: string;
      title: string | null;
      description: string | null;
    }[];
    videos: {
      url: string;
      title: string | null;
      description: string | null;
    }[];
    lives: {
      url: string;
      title: string | null;
      description: string | null;
    }[];
  };
  detail: string | null;
  organization: Organization;
  organizations: Organization[];
  features: {
    self: string[];
    common: string[];
  };
  featureIds: string[];
  regionId: string;
  region: Region;
}

export const EditEventSchema = z.object({
  name: z.string({ message: "文本不能为空" }).min(1, { message: "文本不能为空" }),
  slug: z
    .string({ message: "Slug不能为空" })
    .min(1, { message: "Slug不能为空" })
    .regex(/^[a-z0-9-]+$/, {
      message: "只允许小写英文字母、数字和连字符-",
    }),
  startAt: z.string(),
  endAt: z.string(),
  status: z.string(),
  scale: z.string(),
  type: z.string().nullable(),
  locationType: z.string().nullable(),
  // source 已经废弃，迁移到 sources 字段
  source: z.string().nullable(),
  sources: z
    .array(
      z.object({
        name: z.string().min(1, { message: "信息来源名称不能为空" }).nullable(),
        url: z.string().min(1, { message: "信息来源链接不能为空" }),
        description: z.string().nullable(),
      }),
    )
    .nullable(),
  ticketChannels: z
    .array(
      z.object({
        type: z.enum(["wxMiniProgram", "url", "qrcode", "app"], {
          message: "请选择渠道类型",
        }),
        name: z.string().min(1, { message: "渠道名称不能为空" }),
        url: z.string().min(1, { message: "渠道链接不能为空" }),
        available: z.boolean(),
      }),
    )
    .nullable(),
  address: z.string().nullable(),
  addressLat: z.string().nullable(),
  addressLon: z.string().nullable(),
  thumbnail: z.string(),
  media: z.object({
    images: z
      .array(
        z.object({
          url: z.string().min(1, { message: "图片地址不能为空" }),
          title: z.string().nullable(),
          description: z.string().nullable(),
        }),
      )
      .optional(),
    videos: z
      .array(
        z.object({
          url: z.string().min(1, { message: "视频地址不能为空" }),
          title: z.string().nullable(),
          description: z.string().nullable(),
        }),
      )
      .optional(),
    lives: z
      .array(
        z.object({
          url: z.string().min(1, { message: "直播地址不能为空" }),
          title: z.string().nullable(),
          description: z.string().nullable(),
        }),
      )
      .optional(),
  }),
  detail: z.string().nullable(),
  organization: z.uuid({
    message: "请选择展会主办方",
  }),
  organizations: z.array(
    z.string({ message: "请选择展会协办方" }).uuid({
      message: "请选择展会协办方",
    }),
  ),
  features: z.object({
    self: z.array(z.string()).nullable(),
    common: z.array(z.uuid()).nullable(),
  }),
  featureIds: z.array(z.string()),
  regionId: z.uuid({ message: "请选择展会地区" }),
});

export type EventItem = IEvent;
export type EditableEvent = InferZodType<typeof EditEventSchema>;
