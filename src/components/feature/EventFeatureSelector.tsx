import { FeatureAPI } from "@/api/cms/feature";
import type { Feature } from "@/types/feature";
import type { List } from "@/types/request";
import { FeatureCategoryLabel } from "@/types/feature";
import { Select, Spin, SelectProps } from "antd";
import { debounce, uniqBy } from "es-toolkit";
import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";

interface EventFeatureSelectorProps {
  id?: string;
  value?: string[];
  onChange?: (value?: string[]) => void;
  onSelect?: (value?: Feature[]) => void;
  selectedOptions?: Feature[];
  disabledIds?: string[];
  antdSelectProps?: SelectProps;
}

export default function EventFeatureSelector({
  id,
  value,
  onChange,
  onSelect,
  selectedOptions,
  disabledIds = [],
  antdSelectProps,
}: EventFeatureSelectorProps) {
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading, error } = useSWR<List<Feature>, Error>(
    ["feature/list", "public", searchValue],
    () =>
      FeatureAPI.getFeatureList({ pageSize: 50, current: 1, name: searchValue, isPublic: true }),
  );

  const features = uniqBy(
    [...(selectedOptions || []), ...(data?.records || [])],
    (feature) => feature.id,
  );

  const disabledIdSet = new Set(disabledIds);
  const selectOptions = features.reduce(
    (acc, feature) => {
      const category = feature.category as keyof typeof FeatureCategoryLabel;
      const groupLabel = FeatureCategoryLabel[category] || "其他";

      const option = {
        label: feature.name,
        value: feature.id,
        feature,
        disabled: disabledIdSet.has(feature.id),
      };
      const existingGroup = acc.find((group) => group.label === groupLabel);
      if (existingGroup) {
        existingGroup.options.push(option);
      } else {
        acc.push({ label: groupLabel, options: [option] });
      }
      return acc;
    },
    [] as Array<{
      label: string;
      options: Array<{ label: string; value: string; feature: Feature; disabled: boolean }>;
    }>,
  );

  const handleSearch = useMemo(() => debounce(setSearchValue, 300), []);
  useEffect(() => () => handleSearch.cancel(), [handleSearch]);

  const handleChange = (selectedValue: string[]) => {
    onChange?.(selectedValue);
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
      status={error ? "error" : undefined}
      optionRender={(option) =>
        "disabled" in option.data && option.data.disabled
          ? `${option.data.label}（已添加）`
          : option.data.label
      }
      notFoundContent={
        isLoading ? <Spin size="small" /> : error ? "加载失败，请重新搜索" : "未找到公共标签"
      }
    />
  );
}
