import Axios from "@/api";
import type { TencentLocation } from "@/types/map";

type MapSearchResponse = {
  status: number;
  message?: string;
  count: number;
  data?: TencentLocation[];
};

export async function getTencentLocation(params: { region?: string; keyword: string }) {
  const res = await Axios.post<MapSearchResponse>("/cms/infra/map/suggestion", params);
  if (res.data.status !== 0) {
    throw new Error(res.data.message || "腾讯地图搜索失败，请稍后重试");
  }
  return { count: res.data.count, data: res.data.data ?? [] };
}

export async function getTencentNearbyLocations(params: { latitude: number; longitude: number }) {
  const res = await Axios.post<MapSearchResponse>("/cms/infra/map/reverse-geocode", params);
  if (res.data.status !== 0) {
    throw new Error(res.data.message || "腾讯地图搜索失败，请稍后重试");
  }
  return { count: res.data.count, data: res.data.data ?? [] };
}
