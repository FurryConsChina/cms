import Axios from "@/api";
import type { EditableEvent, EventItem } from "@/types/event";
import type { List } from "@/types/Request";

export async function getEventList(params: {
  pageSize: number;
  current: number;
  search?: string;
  orgSearch?: string;
}) {
  const res = await Axios.get<List<EventItem>>("/event/list", {
    params,
  });

  return res.data;
}

export async function getEventDetail(params: { id: string }) {
  const res = await Axios.get<EventItem>(`/open/v1/event/detail/${params.id}`);

  return res.data;
}

export async function createEvent(event: EditableEvent) {
  const res = await Axios.post<EventItem>("/internal/cms/event/create", {
    event,
  });

  return res.data;
}

export async function updateEvent(event: EditableEvent) {
  const res = await Axios.post<EventItem>("/internal/cms/event/update", {
    event,
  });

  return res.data;
}

export async function deleteEvent(id: string) {
  const res = await Axios.post<{ success: boolean }>(
    "/internal/cms/event/delete",
    {
      id,
    }
  );

  return res.data;
}
