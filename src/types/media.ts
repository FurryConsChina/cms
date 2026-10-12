export type MediaOwner = { entityType: "event" | "organization" | "profile" | "event_participation"; entityId: string };
export type MediaBinding = {
  mediaAssetId: string;
  url?: string;
  title?: string | null;
  description?: string | null;
  altText?: string | null;
};
export type MediaUsage = MediaBinding & { role: string; sortOrder: number };
export type MediaAsset = {
  id: string;
  url: string;
  sourceType: "upload" | "external" | "legacy";
  mimeType: string | null;
  sizeBytes: number | null;
  status: "pending" | "ready" | "failed" | "deleting" | "deleted";
  ownerType: string | null;
  ownerId: string | null;
  objectKey: string | null;
  createdAt: string;
};
