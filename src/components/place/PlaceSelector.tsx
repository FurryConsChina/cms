import { useEffect, useImperativeHandle, useState, type Ref } from "react";
import { Select, type SelectProps } from "antd";
import useSWR from "swr";
import { PlaceAPI } from "@/api/cms/place";
import type { Place } from "@/types/place";
import type { List } from "@/types/request";

export interface PlaceSelectorHandle {
  refresh: () => Promise<unknown>;
}

interface PlaceSelectorProps {
  ref?: Ref<PlaceSelectorHandle>;
  id?: string;
  value?: string | null;
  onChange?: (value?: string) => void;
  regionId?: string;
  selectedOption?: Place | null;
  antdSelectProps?: SelectProps;
}

export default function PlaceSelector({
  ref,
  id,
  value,
  onChange,
  regionId,
  selectedOption,
  antdSelectProps,
}: PlaceSelectorProps) {
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const trimmedSearch = search.trim();
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(trimmedSearch), 300);
    return () => clearTimeout(timer);
  }, [trimmedSearch]);
  const { data, error, isLoading, isValidating, mutate } = useSWR<List<Place>, Error>(
    regionId ? ["place-selector", regionId, keyword] : null,
    ([, regionId, name]: [string, string, string]) =>
      PlaceAPI.list({ current: 1, pageSize: 100, regionId, name: name || undefined }),
  );
  useImperativeHandle(ref, () => ({ refresh: () => mutate() }), [mutate]);
  const records = data?.records ?? [];
  const places =
    selectedOption &&
    selectedOption.regionId === regionId &&
    !records.some((place) => place.id === selectedOption.id)
      ? [selectedOption, ...records]
      : records;

  return (
    <Select
      allowClear
      placeholder="搜索并选择场地"
      {...antdSelectProps}
      id={id}
      value={value}
      disabled={!regionId || antdSelectProps?.disabled}
      onChange={(value: string | undefined) => onChange?.(value)}
      showSearch={{ onSearch: setSearch, filterOption: false }}
      loading={isLoading || isValidating}
      status={error ? "error" : antdSelectProps?.status}
      options={places.map((place) => ({
        value: place.id,
        label: `${place.name}${place.address ? `（${place.address}）` : ""}`,
      }))}
      notFoundContent={error ? "场地加载失败，请重试" : isLoading ? "加载中…" : "没有匹配的场地"}
    />
  );
}
