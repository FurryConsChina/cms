import { RegionAPI } from "@/api/dashboard/region";
import type { Region } from "@/types/region";
import { Select, Spin, Form, SelectProps } from "antd";
import { debounce, uniqBy } from "es-toolkit";
import { useState, useCallback } from "react";
import useSWR from "swr";

interface RegionSelectorProps {
  id?: string;
  value?: string;
  onChange?: (value?: string) => void;
  onSelect?: (value?: Region) => void;
  selectedOption?: Region;
  antdSelectProps?: SelectProps;
}

export default function RegionSelector({
  id,
  value,
  onChange,
  onSelect,
  selectedOption,
  antdSelectProps,
}: RegionSelectorProps) {
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = useSWR(["region/list", searchValue], () =>
    RegionAPI.getRegionList({ pageSize: 50, current: 1, code: searchValue }),
  );

  const regions = uniqBy(
    [...(selectedOption ? [selectedOption] : []), ...(data?.records || [])],
    (region) => region.id,
  );

  const selectOptions = regions.map((region) => ({
    value: region.id,
    label: `${region.name} (${region.code})`,
  }));

  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchValue(value);
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
        optionFilterProp: "label",
        onSearch: handleSearch,
      }}
      loading={isLoading}
      notFoundContent={isLoading ? <Spin size="small" /> : "没找到什么内容"}
      placeholder="请选择地区"
    />
  );
}
