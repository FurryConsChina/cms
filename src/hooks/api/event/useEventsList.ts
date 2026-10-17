import useSWR from "swr";
import { EventAPI, type EventListQuery } from "@/api/cms/event";
import useAuthStore from "@/stores/auth";

export function useEventsList(params: EventListQuery) {
  const userId = useAuthStore((state) => state.user?.id);
  const role = useAuthStore((state) => state.user?.role);

  return useSWR(userId ? ["event-list", userId, role, params] : null, () =>
    EventAPI.getEventList(params),
  );
}
