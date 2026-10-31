import Axios from "@/api";
import { z } from "zod";
import dayjs from "dayjs";
import type { List, PageQuery } from "@/types/request";
import type { Benefit, Offer } from "@/types/participant";

export const benefitSchema = z.object({
  eventId: z.uuid(),
  name: z.string().min(1, "请填写权益名称").max(256),
  description: z.string().nullish(),
  category: z.string().max(64).nullish(),
  sortOrder: z.number().int().min(0),
});

export type BenefitInput = z.infer<typeof benefitSchema>;

export const toBenefitInput = (v: Benefit): BenefitInput => ({
  eventId: v.eventId,
  name: v.name,
  description: v.description,
  category: v.category,
  sortOrder: v.sortOrder,
});

export const offerSchema = z
  .object({
    eventId: z.uuid(),
    name: z.string().min(1, "请填写票档名称").max(256),
    description: z.string().nullish(),
    availability: z.enum(["upcoming", "onSale", "soldOut", "ended"]),
    price: z.number().min(0).nullish(),
    priceNote: z.string().nullish(),
    currency: z.string().length(3, "货币请使用三位代码，例如 CNY"),
    saleStartAt: z.iso.datetime().nullish(),
    saleEndAt: z.iso.datetime().nullish(),
    admissionDates: z.array(z.iso.datetime()).nullish(),
    sortOrder: z.number().int().min(0),
    benefits: z
      .array(
        z.object({
          benefitId: z.uuid(),
          quantity: z.number().int().min(1).nullish(),
          note: z.string().nullish(),
        }),
      )
      .optional(),
  })
  .refine((v) => new Set(v.benefits?.map((b) => b.benefitId)).size === (v.benefits?.length ?? 0), {
    message: "不能重复添加同一权益",
    path: ["benefits"],
  })
  .refine(
    (v) => !v.saleStartAt || !v.saleEndAt || Date.parse(v.saleStartAt) <= Date.parse(v.saleEndAt),
    {
      message: "售票结束时间不能早于开始时间",
      path: ["saleEndAt"],
    },
  );

export type OfferInput = z.infer<typeof offerSchema>;

/** 不传 benefits 时，后端保留原有权益关联。 */
export const toOfferInput = (v: Offer): OfferInput => ({
  eventId: v.eventId,
  name: v.name,
  description: v.description,
  availability: v.availability,
  price: v.price == null ? null : Number(v.price),
  priceNote: v.priceNote,
  currency: v.currency,
  saleStartAt: v.saleStartAt,
  saleEndAt: v.saleEndAt,
  admissionDates: v.admissionDates?.map((value) => dayjs(value).toISOString()),
  sortOrder: v.sortOrder,
});

export class BenefitAPI {
  static async list(params: PageQuery & { eventId?: string }) {
    return (await Axios.get<List<Benefit>>("/cms/benefit", { params })).data;
  }

  static async save(id: string | undefined, benefit: BenefitInput) {
    return (await Axios.post<Benefit>(id ? `/cms/benefit/${id}` : "/cms/benefit", { benefit }))
      .data;
  }

  static async delete(id: string) {
    return (await Axios.delete(`/cms/benefit/${id}`)).data;
  }
}

export class OfferAPI {
  static async list(
    params: PageQuery & { eventId?: string; name?: string; availability?: Offer["availability"] },
  ) {
    return (await Axios.get<List<Offer>>("/cms/offer", { params })).data;
  }

  static async save(id: string | undefined, offer: OfferInput) {
    return (await Axios.post<Offer>(id ? `/cms/offer/${id}` : "/cms/offer", { offer })).data;
  }

  static async delete(id: string) {
    return (await Axios.delete(`/cms/offer/${id}`)).data;
  }
}
