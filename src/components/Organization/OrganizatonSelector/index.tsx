import { getOrganizationList } from "@/api/dashboard/organization";
import type { Organization } from "@/types/organization";
import { Input } from "@mantine/core";
import { Select, Spin } from "antd";
import { useState, useCallback } from "react";
import useSWR from "swr";
import { debounce } from "es-toolkit";

interface OrganizationSelectorProps {
  value?: string;
  onChange?: (value: string | string[] | null) => void;
  onSelect?: (value: Organization | Organization[] | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
  selectedOption?: Organization | null;
  multiple?: boolean;
}

export default function OrganizationSelector({
  value,
  onChange,
  onSelect,
  placeholder = "请选择组织",
  label = "组织",
  required = false,
  disabled = false,
  error,
  description,
  selectedOption,
  multiple = false,
  ...props
}: OrganizationSelectorProps) {
  const [searchValue, setSearchValue] = useState("");

  const {
    data,
    error: swrError,
    isLoading,
  } = useSWR(
    searchValue
      ? [
          `organization-list-search`,
          { pageSize: 50, current: 1, name: searchValue },
        ]
      : [`organization-list`, { pageSize: 50, current: 1 }],
    ([_, params]: [string, any]) => getOrganizationList(params)
  );

  const organizations = [
    ...(selectedOption ? [selectedOption] : []),
    ...(data?.records || []),
  ];

  // 转换为 Select 组件需要的格式
  const selectOptions = organizations.map((organization) => ({
    value: organization.id,
    label: `${organization.name} (${organization.slug})`,
    organization,
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
  const handleChange = (selectedValue: string | string[]) => {
    onChange?.(selectedValue);
    if (multiple) {
      onSelect?.(
        organizations.filter((organization) =>
          selectedValue.includes(organization.id)
        )
      );
    } else {
      onSelect?.(
        organizations.find(
          (organization) => organization.id === selectedValue
        ) || null
      );
    }
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
        mode={multiple ? "multiple" : undefined}
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
