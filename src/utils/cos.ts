import COS from "cos-js-sdk-v5";

import { getUploadSignature } from "@/api/dashboard/upload";

export async function uploadToCOS({
  pathKey,
  file,
}: {
  pathKey: string;
  file: File;
}) {
  const signedKey = await getUploadSignature({ pathKey });

  const {
    tempSecretId,
    tempSecretKey,
    sessionToken,
    startTime,
    expiredTime,
    bucket,
    region,
    key,
  } = signedKey;
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
    Body: file, // 要上传的文件对象。
    SliceSize: 1024 * 1024 * 50, // 分片大小，单位 B，默认 1MB。
    onProgress: (progressData) => {
      console.log("上传进度：", progressData);
    },
  });

  return uploadRes;
}
