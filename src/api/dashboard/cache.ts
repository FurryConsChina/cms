import Axios from "@/api";

export async function cleanPageCache(path: string) {
  const res = await Axios.post<{}>("/internal/infra/cache/clean", { path });
  return res.data;
}
