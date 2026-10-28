import Axios from "@/api";
import type { AuditLog } from "@/types/access";
import type { List, PageQuery } from "@/types/request";

export type AuditLogQuery = PageQuery & {
  action?: string;
  targetType?: string;
  actorUserId?: string;
  organizationId?: string;
  createdFrom?: string;
  createdTo?: string;
};

export class AdminAuditLogApi {
  static async list(params: AuditLogQuery) {
    const res = await Axios.get<List<AuditLog>>("/cms/admin/audit-logs", { params });
    return res.data;
  }
}
