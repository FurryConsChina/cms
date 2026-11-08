export type CarouselItem = {
  mediaAssetId: string;
  imageUrl: string;
  url: string;
  altText: string;
  sponsorName: string;
};

export type SloganSetting = {
  "zh-Hans": string;
  "zh-Hant": string;
  en: string;
};

export type SiteSettingValueMap = {
  carousel: CarouselItem[];
  slogan: SloganSetting;
};

export type SiteSettingKey = keyof SiteSettingValueMap;

export type SiteSetting<K extends SiteSettingKey = SiteSettingKey> = {
  [P in K]: {
    id: string | null;
    key: P;
    value: SiteSettingValueMap[P] | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
}[K];

export type SaveCarouselSettingPayload = Omit<CarouselItem, "imageUrl">[];
export type SaveCarouselSettingBody = { value: SaveCarouselSettingPayload };
export type SaveSloganSettingPayload = SloganSetting;
export type SaveSloganSettingBody = { value: SaveSloganSettingPayload };
