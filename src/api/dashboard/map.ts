import Axios from "@/api";
import { TencentLocation } from "@/types/map";

export async function getTencentLocation(params: {
  region: string;
  keyword: string;
}) {
  const res = await Axios.post<{ count: number; data: TencentLocation[] }>(
    `/internal/infra/map/suggestion`,
    { ...params }
  );
  return res.data;
}
