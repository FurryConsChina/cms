import { Select, type SelectProps } from "antd";
import useSWR from "swr";
import { BenefitAPI } from "@/api/cms/offer";
import type { Benefit } from "@/types/participant";
import type { List } from "@/types/request";

interface BenefitSelectorProps {
  id?: string;
  value?: string | null;
  onChange?: (value?: string) => void;
  eventId: string;
  antdSelectProps?: SelectProps;
}

export default function BenefitSelector({
  id,
  value,
  onChange,
  eventId,
  antdSelectProps,
}: BenefitSelectorProps) {
  const { data, error, isLoading } = useSWR<List<Benefit>, Error>(
    ["offer-benefit-options", eventId],
    ([, eventId]: [string, string]) => BenefitAPI.list({ eventId, current: 1, pageSize: 100 }),
  );

  return (
    <Select
      placeholder="选择权益"
      {...antdSelectProps}
      id={id}
      value={value}
      onChange={(value: string | undefined) => onChange?.(value)}
      loading={isLoading}
      status={error ? "error" : antdSelectProps?.status}
      options={data?.records.map((benefit) => ({ value: benefit.id, label: benefit.name })) ?? []}
      notFoundContent={
        error ? "权益加载失败，请重试" : isLoading ? "加载中…" : "这个活动还没有权益"
      }
    />
  );
}
