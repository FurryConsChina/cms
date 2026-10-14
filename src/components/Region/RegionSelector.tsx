import { RegionAPI } from "@/api/dashboard/region";
import type { Region } from "@/types/region";
import { Select, Spin, SelectProps } from "antd";
import { debounce, uniqBy } from "es-toolkit";
import { useState, useCallback, useImperativeHandle, type Ref } from "react";
import useSWR from "swr";

export interface RegionSelectorHandle {
  refresh: () => Promise<unknown>;
}

interface RegionSelectorProps {
  ref?: Ref<RegionSelectorHandle>;
  id?: string;
  value?: string;
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

  const { data, isLoading, isValidating, mutate } = useSWR(["region/list", searchValue], () =>
    RegionAPI.getRegionList({ pageSize: 50, current: 1, search: searchValue || undefined }),
  );

  useImperativeHandle(ref, () => ({ refresh: () => mutate() }), [mutate]);

  const regions = uniqBy(
    [...(selectedOption ? [selectedOption] : []), ...(data?.records || [])],
    (region) => region.id,
  );

  const selectOptions = regions.map((region) => ({
    value: region.id,
    label: `${region.name} (${region.slug})`,
  }));

  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchValue(value.trim());
    }, 300),
    [],
  );

  const handleChange = (selectedValue: string) => {
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
        onSearch: handleSearch,
      }}
      loading={isLoading || isValidating}
      notFoundContent={isLoading ? <Spin size="small" /> : "没找到什么内容"}
      placeholder="输入地区名称或代码搜索"
    />
  );
}
