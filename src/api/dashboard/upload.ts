import Axios from "@/api";

export async function uploadStatic(form: FormData) {
  const res = await Axios.post<{ S3UploadRes: { ETag: string } }>(
    "/third/upload/static",
    form
  );

  return res.data;
}
