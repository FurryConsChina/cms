import Axios from "@/api";
import type { EditableRegion, Region } from "@/types/region";
import type { List } from "@/types/Request";

export async function getRegionList(params: {
  pageSize: number;
  current: number;
  code?: string;
}) {
  const res = await Axios.get<List<Region>>("/internal/cms/region", {
    params,
  });

  return res.data;
}

export async function createRegion(region: EditableRegion) {
  const res = await Axios.post<Region>("/internal/cms/region", {
    region,
  });

  return res.data;
}

export async function updateRegion(id: string, region: EditableRegion) {
  const res = await Axios.post<Region>(`/internal/cms/region/${id}`, {
    region,
  });

  return res.data;
}

export async function getRegion(id: string) {
  const res = await Axios.get<Region>(`/internal/cms/region/${id}`);

  return res.data;
}

export async function deleteRegion(id: string) {
  const res = await Axios.delete<{
    success: boolean;
  }>(`/internal/cms/region/${id}`);

  return res.data;
}
