import COS from "cos-js-sdk-v5";

import { confirmUpload, getUploadSignature } from "@/api/cms/upload";

export async function uploadToCOS({
  file,
  onProgress,
}: {
  file: File;
  onProgress?: (percent: number) => void;
}) {
  // 后端仅使用扩展名识别类型；裁剪后的 MIME 类型可能与原文件名不同。
  const fileName = `image.${file.type.split("/")[1]}`;
  const signedKey = await getUploadSignature({ fileName });

  const { tempSecretId, tempSecretKey, sessionToken, startTime, expiredTime, bucket, region, key } =
    signedKey;
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
