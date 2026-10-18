import { useQuery } from "@tanstack/react-query";
import { AdminApplicationApi } from "@/api/cms/admin/application";
import useAuthStore from "@/stores/auth";
import type { PageQuery } from "@/types/request";
import { isAdmin } from "@/utils/permissions";

export function useAdminApplicationsList({ current, pageSize }: PageQuery) {
  const userId = useAuthStore((state) => state.user?.id);
  const admin = useAuthStore((state) => isAdmin(state.user?.role));

  return useQuery({
    queryKey: ["application-list", "all", userId, current, pageSize],
    queryFn: () => AdminApplicationApi.getApplicationList(current, pageSize),
    enabled: !!userId && admin,
  });
}
