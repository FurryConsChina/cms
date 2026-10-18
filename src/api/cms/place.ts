import Axios from "@/api";
import { z } from "zod";
import type { List, PageQuery } from "@/types/request";
import type { Place } from "@/types/place";

export const placeSchema = z
  .object({
    regionId: z.uuid("请选择所属地区"),
    name: z.string().min(1, "请填写地点名称").max(256),
    kind: z.enum(["venue", "food", "attraction", "hotel", "transport_hub"]),
    subtype: z.string().max(64).nullish(),
    address: z.string().nullish(),
    latitude: z.number().min(-90).max(90).nullish(),
    longitude: z.number().min(-180).max(180).nullish(),
    timezone: z.string().max(64).nullish(),
    coordinateSource: z.enum(["tencent", "manual"], { error: "请选择腾讯地图或手动" }).nullish(),
    sourceCoordinateSystem: z
      .enum(["WGS84", "GCJ02", "BD09"], { error: "请选择有效的原始坐标系，未知时可留空" })
      .nullish(),
    sourcePlaceId: z.string().max(256).nullish(),
  })
  .refine((v) => (v.latitude == null) === (v.longitude == null), {
    message: "经度和纬度必须同时填写或同时留空",
    path: ["longitude"],
  });

export type PlaceInput = z.infer<typeof placeSchema>;

export class PlaceAPI {
  static async list(
    params: PageQuery & { name?: string; kind?: Place["kind"]; regionId?: string },
  ) {
    return (await Axios.get<List<Place>>("/cms/place", { params })).data;
  }

  static async save(id: string | undefined, place: PlaceInput) {
    return (await Axios.post<Place>(id ? `/cms/place/${id}` : "/cms/place", { place })).data;
  }

  static async delete(id: string) {
    return (await Axios.delete(`/cms/place/${id}`)).data;
  }

  static async rebuildGeoIndex() {
    return (await Axios.post<{ indexed: number }>("/cms/admin/place/rebuild-geo-index")).data;
  }
}
