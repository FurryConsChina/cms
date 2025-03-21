import Axios from "@/api";
import type { EditableEvent, EventItem } from "@/types/event";
import type { List } from "@/types/Request";

export async function getEventList(params: {
  pageSize: number;
  current: number;
  search: string | null;
  orgSearch: string | null;
}) {
  const res = await Axios.get<List<EventItem>>("/internal/cms/event/list", {
    params,
  });

  return res.data;
}

export async function getEventDetail(params: { id: string }) {
  const res = await Axios.get<EventItem>(`/open/v1/event/detail/${params.id}`);

  return res.data;
}

export async function createEvent(event: EditableEvent) {
  const res = await Axios.post<EventItem>("/internal/cms/event", {
    event,
  });

  return res.data;
}

export async function updateEvent(eventId: string, event: EditableEvent) {
  const res = await Axios.post<EventItem>(`/internal/cms/event/${eventId}`, {
    event,
  });

  return res.data;
}

export async function deleteEvent(id: string) {
  const res = await Axios.post<{ success: boolean }>(
    `/internal/cms/event/${id}`,
    {
      id,
    }
  );

  return res.data;
}
