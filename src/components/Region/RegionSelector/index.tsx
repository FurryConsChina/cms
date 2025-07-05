import { getRegionList } from "@/api/dashboard/region";
import type { Region } from "@/types/region";
import { Input } from "@mantine/core";
import { Select, Spin } from "antd";
import { debounce } from "es-toolkit";
import { useState, useCallback } from "react";
import useSWR from "swr";

interface RegionSelectorProps {
  value?: string;
  onChange?: (value: string | null) => void;
  onSelect?: (value: Region | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
  selectedOption?: Region | null;
}

export default function RegionSelector({
  value,
  onChange,
  onSelect,
  placeholder = "请选择区域",
  label = "区域",
  required = false,
  disabled = false,
  error,
  description,
  selectedOption,
  ...props
}: RegionSelectorProps) {
  const [searchValue, setSearchValue] = useState("");

  const {
    data,
    error: swrError,
    isLoading,
  } = useSWR(
    searchValue
      ? [`region-list-search`, { pageSize: 50, current: 1, code: searchValue }]
      : [`region-list`, { pageSize: 50, current: 1 }],
    ([_, params]: [string, any]) => getRegionList(params)
  );

  const regions = [
    ...(selectedOption ? [selectedOption] : []),
    ...(data?.records || []),
  ];

  // 转换为 Select 组件需要的格式
  const selectOptions = regions.map((region) => ({
    value: region.id,
    label: `${region.name} (${region.code})`,
    region,
  }));

  // 使用 useCallback 和 debounce 处理搜索
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchValue(value);
    }, 300),
    []
  );

  // 处理搜索
  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };
  // 处理选择变化
  const handleChange = (selectedValue: string) => {
    onChange?.(selectedValue);
    onSelect?.(regions.find((region) => region.id === selectedValue) || null);
  };

  return (
    <Input.Wrapper
      label={label}
      description={description}
      error={error}
      withAsterisk={required}
    >
      <Select
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        options={selectOptions}
        optionFilterProp="label"
        showSearch
        onSearch={handleSearch}
        disabled={disabled}
        allowClear
        loading={isLoading}
        notFoundContent={isLoading ? <Spin size="small" /> : "没找到什么内容"}
        style={{ width: "100%" }}
        status={error || swrError ? "error" : undefined}
        {...props}
      />
    </Input.Wrapper>
  );
}
