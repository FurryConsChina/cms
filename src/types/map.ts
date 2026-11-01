export type TencentLocation = {
  id: string;
  title: string;
  address: string;
  category: string;
  type?: number;
  distance?: number;
  location: {
    lat: number;
    lng: number;
  };
  adcode?: string | number;
  province?: string;
  city?: string;
  district?: string;
  matchedRegion?: { id: string; name: string; timezone: string | null } | null;
};
