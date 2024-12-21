import Axios from "@/api";
import type {
  CrateFeatureType,
  EditableFeatureType,
  FeatureType,
} from "@/types/feature";
import type { List } from "@/types/Request";

export async function getFeatureList(params: {
  pageSize: number;
  current: number;
}) {
  const res = await Axios.get<List<FeatureType>>("/event/feature", {
    params,
  });

  return res.data;
}

export async function createFeature(feature: CrateFeatureType) {
  const res = await Axios.post<FeatureType>("/event/feature/create", {
    feature,
  });

  return res.data;
}

export async function updateFeature(feature: EditableFeatureType) {
  const res = await Axios.post<FeatureType>("/event/feature/update", {
    feature,
  });

  return res.data;
}
