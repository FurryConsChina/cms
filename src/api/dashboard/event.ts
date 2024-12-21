import Axios from "@/api";
import type { EditableEventType, EventType } from "@/types/event";
import type { List } from "@/types/Request";

export async function getEventList(params: {
  pageSize: number;
  current: number;
}) {
  const res = await Axios.get<List<EventType>>("/event/list", {
    params,
  });

  return res.data;
}

export async function getEventDetail(params: { id: string }) {
  const res = await Axios.get<EventType>(`/event/detail/${params.id}`);

  return res.data;
}

export async function createEvent(event: EditableEventType) {
  const res = await Axios.post<EventType>("/event/create", {
    event,
  });

  return res.data;
}

export async function updateEvent(event: EditableEventType) {
  const res = await Axios.post<EventType>("/event/update", {
    event,
  });

  return res.data;
}
