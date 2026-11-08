import Axios from "@/api";
import type {
  SaveCarouselSettingBody,
  SaveSloganSettingBody,
  SiteSetting,
} from "@/types/siteSetting";

export class AdminSiteSettingApi {
  static async list() {
    return (await Axios.get<SiteSetting[]>("/cms/admin/site-settings")).data;
  }

  static async updateCarousel(body: SaveCarouselSettingBody) {
    return (await Axios.put<SiteSetting<"carousel">>("/cms/admin/site-settings/carousel", body))
      .data;
  }

  static async updateSlogan(body: SaveSloganSettingBody) {
    return (await Axios.put<SiteSetting<"slogan">>("/cms/admin/site-settings/slogan", body)).data;
  }
}
