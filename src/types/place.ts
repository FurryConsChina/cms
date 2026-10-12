import type { Region } from "./region";

export type Place = {
  id: string;
  regionId: string;
  name: string;
  kind: "venue" | "food" | "attraction" | "hotel" | "transport_hub";
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  subtype?: string | null;
  timezone?: string | null;
  coordinateSource?: string | null;
  sourceCoordinateSystem?: string | null;
  sourcePlaceId?: string | null;
  region?: Region;
};
