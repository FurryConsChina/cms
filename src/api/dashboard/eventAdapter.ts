import type { EventItem, EventResponse } from "@/types/event";
import type { MediaUsage } from "@/types/media";

export function toEventItem(event: EventResponse, usages: MediaUsage[] = []): EventItem {
  const organizations = event.organizers.map((item) => item.organization);
  const primary = event.organizers.find((item) => item.isPrimary)?.organization ?? organizations[0];
  return {
    ...event,
    organization: primary ?? null,
    organizations: organizations.filter((item) => item.id !== primary?.id),
    features: {
      self: event.features.filter((item) => !item.isPublic).map((item) => item.name),
      common: event.features.filter((item) => item.isPublic).map((item) => item.id),
    },
    featureIds: event.features.filter((item) => item.isPublic).map((item) => item.id),
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
