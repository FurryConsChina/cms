import Axios from "@/api";
import { EditableEventType, EventType } from "@/types/event";
import { List } from "@/types/Request";

export async function getEventList(params: {
  pageSize: number;
  current: number;
}) {
  const res = await Axios.get<List<EventType>>("/event/list", {
    params,
  });

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
