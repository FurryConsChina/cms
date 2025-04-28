import {
  EventLocationType,
  EventScale,
  EventStatus,
  EventType,
} from "@/types/event";

export const EventStatusLabel = {
  [EventStatus.EventScheduled]: "正常",
  [EventStatus.EventPostponed]: "延期（未知）",
  [EventStatus.EventRescheduled]: "延期（已知）",
  [EventStatus.EventMovedOnline]: "线上",
  [EventStatus.EventCancelled]: "取消",
};

export const EventScaleLabel = {
  [EventScale.Cosy]: "迷你(50+)",
  [EventScale.Small]: "小型(100+)",
  [EventScale.Medium]: "中型(500+)",
  [EventScale.Large]: "大型(1000+)",
  [EventScale.XLarge]: "特大型(3000+)",
  [EventScale.XXLarge]: "超特大型(6000+)",
  [EventScale.Mega]: "巨型(10000+)",
};

export const EventStatusColor = {
  [EventStatus.EventScheduled]: "blue",
  [EventStatus.EventPostponed]: "gray",
  [EventStatus.EventRescheduled]: "orange",
  [EventStatus.EventMovedOnline]: "green",
  [EventStatus.EventCancelled]: "red",
};

export const EventTypeLabel = {
  [EventType.AllInCon]: "全能展",
  [EventType.ComicMarket]: "贩售会",
  [EventType.SuitOnlyCon]: "吸毛展",
  [EventType.TravelCon]: "旅游展",
  [EventType.FandomMeetup]: "粉丝见面会等",
};

export const EventLocationTypeLabel = {
  [EventLocationType.Hotel]: "酒店",
  [EventLocationType.Venue]: "场馆",
  [EventLocationType.Online]: "线上",
};
