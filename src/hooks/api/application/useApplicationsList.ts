import { useQuery } from "@tanstack/react-query";
import { ApplicationApi } from "@/api/cms/application";
import useAuthStore from "@/stores/auth";
import type { PageQuery } from "@/types/request";

export function useApplicationsList({ current, pageSize }: PageQuery) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["application-list", "mine", userId, current, pageSize],
    queryFn: () => ApplicationApi.getApplicationList(current, pageSize),
    enabled: !!userId,
  });
}
