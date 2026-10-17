import Axios from "@/api";
import type { List, PageQuery } from "@/types/Request";
import type { AuditLog, Claim, EntityKind, Invitation, Member } from "@/types/access";

const base = (kind: EntityKind) => `/cms/${kind}`;

export class AccessAPI {
  static async entityName(kind: EntityKind, id: string) {
    return (await Axios.get<{ name: string }>(`${base(kind)}/${id}`)).data;
  }

  static async members(kind: EntityKind, id: string, params: PageQuery) {
    return (await Axios.get<List<Member>>(`${base(kind)}/${id}/members`, { params })).data;
  }

  static async removeMember(kind: EntityKind, id: string, memberId: string) {
    return (await Axios.delete(`${base(kind)}/${id}/members/${memberId}`)).data;
  }

  static async leave(kind: EntityKind, id: string) {
    return (await Axios.delete(`${base(kind)}/${id}/members/me`)).data;
  }

  static async invitations(kind: EntityKind, id: string) {
    return (await Axios.get<Invitation[]>(`${base(kind)}/${id}/invitations`)).data;
  }

  static async invite(kind: EntityKind, id: string, email: string) {
    return (
      await Axios.post<{ invitation: Invitation; token: string }>(
        `${base(kind)}/${id}/invitations`,
        { email },
      )
    ).data;
  }

  static async revokeInvitation(kind: EntityKind, id: string) {
    return (await Axios.delete(`${base(kind)}/invitations/${id}`)).data;
  }

  static async acceptInvitation(kind: EntityKind, token: string) {
    return (await Axios.post(`${base(kind)}/invitations/accept`, { token })).data;
  }

  static async claims(kind: EntityKind, pending: boolean) {
    return (
      await Axios.get<Claim[]>(
        pending ? `/cms/admin/${kind}/claims/pending` : `${base(kind)}/claims`,
      )
    ).data;
  }

  static async claim(kind: EntityKind, id: string, reason: string) {
    return (await Axios.post<Claim>(`${base(kind)}/claims`, { [`${kind}Id`]: id, reason })).data;
  }

  static async reviewClaim(kind: EntityKind, id: string, approved: boolean, note?: string) {
    return (await Axios.post<Claim>(`/cms/admin/${kind}/claims/${id}/review`, { approved, note }))
      .data;
  }

  static async auditLogs(id: string, params: PageQuery & { action?: string }) {
    return (await Axios.get<List<AuditLog>>(`/cms/organization/${id}/audit-logs`, { params })).data;
  }
}
