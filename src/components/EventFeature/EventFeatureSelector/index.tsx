import { getFeatureList } from "@/api/dashboard/feature";
import type { FeatureType } from "@/types/feature";
import { FeatureCategoryLabel } from "@/types/feature";
import { Input } from "@mantine/core";
import { Select, Spin } from "antd";
import { debounce } from "es-toolkit";
import { useState, useCallback } from "react";
import useSWR from "swr";

interface EventFeatureSelectorProps {
  value?: string[];
  onChange?: (value: string[] | null) => void;
  onSelect?: (value: FeatureType[] | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
  selectedOptions?: FeatureType[] | null;
}

export default function EventFeatureSelector({
  value,
  onChange,
  onSelect,
  placeholder = "请选择特色标签",
  label = "特色标签",
  required = false,
  disabled = false,
  error,
  description,
  selectedOptions,
  ...props
}: EventFeatureSelectorProps) {
  const [searchValue, setSearchValue] = useState("");

  const {
    data,
    error: swrError,
    isLoading,
  } = useSWR(
    searchValue
      ? [`feature-list-search`, { pageSize: 50, current: 1, name: searchValue }]
      : [`feature-list`, { pageSize: 50, current: 1 }],
    ([_, params]: [string, any]) => getFeatureList(params)
  );

  const features = [...(selectedOptions || []), ...(data?.records || [])];

  // 转换为 Select 组件需要的格式，按分类分组
  const selectOptions = features.reduce((acc, feature) => {
    const category = feature.category as keyof typeof FeatureCategoryLabel;
    const groupLabel = FeatureCategoryLabel[category] || "其他";

    const existingGroup = acc.find((group) => group.label === groupLabel);
    if (existingGroup) {
      existingGroup.options.push({
        label: feature.name,
        value: feature.id,
        feature,
      });
    } else {
      acc.push({
        label: groupLabel,
        options: [
          {
            label: feature.name,
            value: feature.id,
            feature,
          },
        ],
      });
    }
    return acc;
  }, [] as Array<{ label: string; options: Array<{ label: string; value: string; feature: FeatureType }> }>);

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
  const handleChange = (selectedValue: string[]) => {
    onChange?.(selectedValue as string[]);
    onSelect?.(
      features.filter((feature) => selectedValue.includes(feature.id))
    );
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
        mode="multiple"
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
