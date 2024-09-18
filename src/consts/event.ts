import { EventScale, EventStatus } from "@/types/event";

export const EventStatusLabel = {
  [EventStatus.EventScheduled]: "正常",
  [EventStatus.EventPostponed]: "延期（未知）",
  [EventStatus.EventRescheduled]: "延期（已知）",
  [EventStatus.EventMovedOnline]: "线上",
  [EventStatus.EventCancelled]: "取消",
};

export const EventScaleLabel = {
  [EventScale.Cosy]: "小型聚会(Cosy)",
  [EventScale.Small]: "二三线城市(Small)",
  [EventScale.Medium]: "一线城市(Medium)",
  [EventScale.Large]: "大型(Large)",
  [EventScale.Mega]: "超大型(Mega)",
};
