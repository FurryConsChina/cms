import { OrganizationAPI } from "@/api/dashboard/organization";
import type { Organization } from "@/types/organization";
import { Select, SelectProps, Spin } from "antd";
import { useState, useCallback } from "react";
import useSWR from "swr";
import { debounce, uniqBy } from "es-toolkit";

interface OrganizationSelectorProps {
  id?: string;
  value?: string[];
  onChange?: (value: string[] | undefined) => void;
  onSelect?: (value: Organization[] | undefined) => void;
  selectedOptionId?: string;
  selectedOptions?: Organization[];
  antdSelectProps?: SelectProps;
}

export default function OrganizationSelector({
  id,
  value,
  onChange,
  onSelect,
  selectedOptions,
  antdSelectProps,
}: OrganizationSelectorProps) {
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = useSWR(["organization/list", searchValue], () =>
    OrganizationAPI.getOrganizationList({ pageSize: 50, current: 1, name: searchValue })
  );

  const organizations = uniqBy(
    [...(selectedOptions || []), ...(data?.records || [])],
    (organization) => organization.id
  );

  const selectOptions = organizations.map((organization) => ({
    value: organization.id,
    label: `${organization.name} (${organization.slug})`,
  }));

  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchValue(value);
    }, 300),
    []
  );

  const handleChange = (selectedValue: string[]) => {
    onChange?.(selectedValue);
    onSelect?.(organizations.filter((organization) => selectedValue.includes(organization.id)));
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
      labelRender={({ value }) => {
        return organizations.find((organization) => organization.id === value)?.name;
      }}
      placeholder="请选择主办方"
    />
  );
}
