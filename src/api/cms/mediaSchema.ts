import { z } from "zod";

export const mediaBindingSchema = z.object({
  mediaAssetId: z.uuid(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  altText: z.string().nullish(),
});

// 空的单张图片输入表示解除绑定；已填写的资产 ID 仍需严格校验。
export const singleMediaBindingSchema = z.preprocess(
  (value) =>
    typeof value === "object" && value !== null && "mediaAssetId" in value && !value.mediaAssetId
      ? null
      : value,
  z.object({ mediaAssetId: z.uuid() }).nullish(),
);
