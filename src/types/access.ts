import type { Organization } from "./organization";
import type { Profile } from "./profile";

export type EntityKind = "organization" | "profile";

export type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "member";
  createdAt: string;
};

export type Invitation = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type Claim = {
  id: string;
  organizationId?: string;
  profileId?: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  reviewNote: string | null;
  organization?: Organization;
  profile?: Profile;
  user?: { name: string; email: string };
  createdAt: string;
};

export type AuditLog = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown>;
  actorUserId: string | null;
  actor?: { name: string; email: string };
  createdAt: string;
};
