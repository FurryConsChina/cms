import { RegionAPI } from "@/api/cms/region";
import type { Region } from "@/types/region";
import type { List } from "@/types/request";
import { Select, Spin, type SelectProps } from "antd";
import { uniqBy } from "es-toolkit";
import { useState, useEffect, useImperativeHandle, type Ref } from "react";
import useSWR from "swr";

export interface RegionSelectorHandle {
  refresh: () => Promise<unknown>;
}

interface RegionSelectorProps {
  ref?: Ref<RegionSelectorHandle>;
  id?: string;
  value?: string | null;
  onChange?: (value?: string) => void;
  onSelect?: (value?: Region) => void;
  selectedOption?: Region;
  antdSelectProps?: SelectProps;
}

export default function RegionSelector({
  ref,
  id,
  value,
  onChange,
  onSelect,
  selectedOption,
  antdSelectProps,
}: RegionSelectorProps) {
  const [searchValue, setSearchValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const trimmedSearch = searchValue.trim();
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(trimmedSearch), 300);
    return () => clearTimeout(timer);
  }, [trimmedSearch]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<List<Region>, Error>(
    ["region/list", keyword],
    () => RegionAPI.getRegionList({ pageSize: 50, current: 1, search: keyword || undefined }),
    { keepPreviousData: true },
  );
  const records = data?.records ?? [];
  const needsDetail =
    !!value && selectedOption?.id !== value && !records.some((region) => region.id === value);
  const {
    data: selectedRegion,
    error: detailError,
    isLoading: detailLoading,
    isValidating: detailValidating,
  } = useSWR<Region, Error>(needsDetail ? ["region/detail", value] : null, () =>
    RegionAPI.getRegion(value!),
  );

  useImperativeHandle(ref, () => ({ refresh: () => mutate() }), [mutate]);

  const regions = uniqBy(
    [
      ...(selectedOption ? [selectedOption] : []),
      ...(selectedRegion ? [selectedRegion] : []),
      ...records,
    ],
    (region) => region.id,
  );
  const loading = isLoading || isValidating || detailLoading || detailValidating;
  const loadError = error || detailError;
  const selectOptions = regions.map((region) => ({
    value: region.id,
    label: `${region.name} (${region.slug})`,
  }));

  const handleChange = (selectedValue?: string) => {
    onChange?.(selectedValue);
    onSelect?.(regions.find((region) => region.id === selectedValue));
  };

  return (
    <Select
      {...antdSelectProps}
      id={id}
      value={value}
      onChange={handleChange}
      options={selectOptions}
      showSearch={{
        filterOption: false,
        onSearch: setSearchValue,
      }}
      loading={loading}
      status={loadError ? "error" : antdSelectProps?.status}
      notFoundContent={
        loadError ? "加载失败，请重试" : loading ? <Spin size="small" /> : "没找到什么内容"
      }
      placeholder={antdSelectProps?.placeholder ?? "输入地区名称或代码搜索"}
    />
  );
}
