import Axios from "@/api";
import type { MediaAsset, MediaOwner, MediaUsage } from "@/types/media";
import type { List, PageQuery } from "@/types/Request";

export async function uploadStatic(form: FormData) {
  return (
    await Axios.post<{ S3UploadRes: { ETag: string }; mediaAssetId: string; key: string; url: string }>(
      "/cms/infra/upload/static",
      form,
    )
  ).data;
}

export async function getUploadSignature({ pathKey, owner }: { pathKey: string; owner?: MediaOwner }) {
  return (
    await Axios.post<{
      mediaAssetId: string;
      url: string;
      tempSecretId: string;
      tempSecretKey: string;
      sessionToken: string;
      startTime: number;
      expiredTime: number;
      bucket: string;
      region: string;
      key: string;
    }>("/cms/infra/upload/sign", { pathKey, owner })
  ).data;
}

export async function confirmUpload(id: string) {
  return (await Axios.post<{ id: string; url: string }>(`/cms/media/assets/${id}/confirm`)).data;
}

export async function getMediaUsages(owner: MediaOwner) {
  const res = await Axios.get<(MediaUsage & { asset?: { url: string } })[]>(
    `/cms/media/usages/${owner.entityType}/${owner.entityId}`,
  );
  return res.data.map((usage) => ({ ...usage, url: usage.asset?.url ?? usage.url }));
}

export async function createExternalMedia(url: string) {
  return (await Axios.post<{ id: string; url: string }>("/cms/media/assets/external", { url })).data;
}

export async function listMediaAssets(params: PageQuery & { owner?: MediaOwner }) {
  return (await Axios.get<List<MediaAsset>>("/cms/media/assets", { params })).data;
}

export async function deleteMediaAsset(id: string) {
  return (await Axios.delete(`/cms/media/assets/${id}`)).data;
}

export const isImageAsset = (asset: { url?: string; mimeType?: string | null }) =>
  !!asset.mimeType?.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(asset.url ?? "");
