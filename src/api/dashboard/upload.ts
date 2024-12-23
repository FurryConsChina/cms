import Axios from "@/api";

export async function uploadStatic(form: FormData) {
  const res = await Axios.post<{ S3UploadRes: { ETag: string } }>(
    "/third/upload/static",
    form
  );

  return res.data;
}

export async function getUploadSignature({ pathKey }: { pathKey: string }) {
  const res = await Axios.post<{
    tempSecretId: string;
    tempSecretKey: string;
    sessionToken: string;
    startTime: number;
    expiredTime: number;
    bucket: string;
    region: string;
    key: string;
  }>("/third/upload/sign", { pathKey });

  return res.data;
}
