import type { EventItem, EventResponse } from "@/types/event";
import type { MediaUsage } from "@/types/media";

export function toEventItem(event: EventResponse, usages: MediaUsage[] = []): EventItem {
  return {
    ...event,
    regionId: event.region?.id ?? null,
    placeId: event.place?.id ?? null,
    address: event.place?.address ?? null,
    addressLat: event.place?.latitude?.toString() ?? null,
    addressLon: event.place?.longitude?.toString() ?? null,
    cover: usages.find((item) => item.role === "cover") ?? null,
    poster: usages.filter((item) => item.role === "poster"),
    gallery: usages.filter((item) => item.role === "gallery"),
    videos: usages.filter((item) => item.role === "videos"),
    lives: usages.filter((item) => item.role === "lives"),
  };
}
