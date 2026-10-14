import COS from "cos-js-sdk-v5";

import type { MediaOwner } from "@/types/media";
import { confirmUpload, getUploadSignature } from "@/api/dashboard/upload";

export async function uploadToCOS({
  file,
  owner,
  onProgress,
}: {
  file: File;
  owner?: MediaOwner;
  onProgress?: (percent: number) => void;
}) {
  // 后端仅使用扩展名识别类型；裁剪后的 MIME 类型可能与原文件名不同。
  const fileName = `image.${file.type.split("/")[1]}`;
  const signedKey = await getUploadSignature({ fileName, owner });

  const { tempSecretId, tempSecretKey, sessionToken, startTime, expiredTime, bucket, region, key } = signedKey;
  const cos = new COS({
    SecretId: tempSecretId,
    SecretKey: tempSecretKey,
    SecurityToken: sessionToken,
    StartTime: startTime,
    ExpiredTime: expiredTime,
  });

  const uploadRes = await cos.uploadFile({
    Bucket: bucket,
    Region: region,
    Key: key,
    ContentType: file.type,
    Body: file, // 要上传的文件对象。
    SliceSize: 1024 * 1024 * 50, // 分片大小，单位 B，默认 1MB。
    onProgress: (progressData) => {
      onProgress?.(progressData.percent);
    },
  });

  if (!uploadRes.ETag) throw new Error("文件上传失败");
  await confirmUpload(signedKey.mediaAssetId);
  return { ...uploadRes, mediaAssetId: signedKey.mediaAssetId, url: signedKey.url };
}
