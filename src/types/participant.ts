import type { MediaBinding } from "./media";
import type { Organization } from "./organization";
import type { Profile } from "./profile";

export type Participant = {
  id: string;
  eventId: string;
  profileId: string | null;
  organizationId: string | null;
  role: "guest" | "exhibitor" | "sponsor" | "media";
  description: string | null;
  booth: string | null;
  tier: string | null;
  isFeatured: boolean;
  sortOrder: number;
  appearanceDates: string[] | null;
  profile: Profile | null;
  organization: Organization | null;
  portrait?: MediaBinding[];
  gallery?: MediaBinding[];
};

export type Benefit = {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  category: string | null;
  sortOrder: number;
};

export type OfferBenefit = {
  benefitId: string;
  quantity?: number | null;
  note?: string | null;
  benefit?: Benefit;
};

export type Offer = {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  availability: "upcoming" | "onSale" | "soldOut" | "ended";
  price: string | null;
  priceNote: string | null;
  currency: string;
  saleStartAt: string | null;
  saleEndAt: string | null;
  admissionDates: string[] | null;
  sortOrder: number;
  benefitLinks: OfferBenefit[];
};
