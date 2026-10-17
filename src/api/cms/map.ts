import Axios from "@/api";
import { TencentLocation } from "@/types/map";

export async function getTencentLocation(params: { region?: string; keyword: string }) {
  const res = await Axios.post<{
    status: number;
    message?: string;
    count: number;
    data?: TencentLocation[];
  }>(`/cms/infra/map/suggestion`, {
    ...params,
  });
  if (res.data.status !== 0) {
    throw new Error(res.data.message || "腾讯地图搜索失败，请稍后重试");
  }
  return { count: res.data.count, data: res.data.data ?? [] };
}
