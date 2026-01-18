import { FeatureAPI } from "@/api/dashboard/feature";
import type { Feature } from "@/types/feature";
import { FeatureCategoryLabel } from "@/types/feature";
import { Select, Spin, SelectProps } from "antd";
import { debounce, uniqBy } from "es-toolkit";
import { useState, useCallback } from "react";
import useSWR from "swr";

interface EventFeatureSelectorProps {
  id?: string;
  value?: string[];
  onChange?: (value?: string[]) => void;
  onSelect?: (value?: Feature[]) => void;
  selectedOptions?: Feature[];
  antdSelectProps?: SelectProps;
}

export default function EventFeatureSelector({
  id,
  value,
  onChange,
  onSelect,
  selectedOptions,
  antdSelectProps,
}: EventFeatureSelectorProps) {
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = useSWR(["feature/list", searchValue], () =>
    FeatureAPI.getFeatureList({ pageSize: 50, current: 1, name: searchValue })
  );

  const features = uniqBy([...(selectedOptions || []), ...(data?.records || [])], (feature) => feature.id);

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
  }, [] as Array<{ label: string; options: Array<{ label: string; value: string; feature: Feature }> }>);

  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchValue(value);
    }, 300),
    []
  );

  const handleChange = (selectedValue: string[]) => {
    onChange?.(selectedValue as string[]);
    onSelect?.(features.filter((feature) => selectedValue.includes(feature.id)));
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
      mode="multiple"
      loading={isLoading}
      notFoundContent={isLoading ? <Spin size="small" /> : "没找到什么内容"}
    />
  );
}
