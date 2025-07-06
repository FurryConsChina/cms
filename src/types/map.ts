export type TencentLocation = {
  id: string;
  title: string;
  address: string;
  category: string;
  type: number;
  location: {
    lat: number;
    lng: number;
  };
  adcode: number;
  province: string;
  city: string;
  district: string;
};
