import Axios from "@/api";
import type { List, PageQuery } from "@/types/Request";
import type { Place } from "@/types/place";

export class PlaceAPI {
  static async list(params: PageQuery & { name?: string; kind?: Place["kind"]; regionId?: string }) {
    return (await Axios.get<List<Place>>("/cms/place", { params })).data;
  }
}
