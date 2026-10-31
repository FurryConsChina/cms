import Axios from "@/api";
import { OrganizationAPI } from "@/api/cms/organization";
import type { Organization } from "@/types/organization";
import type { List } from "@/types/request";
import { Select, type SelectProps } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { uniqBy } from "es-toolkit";

interface OrganizationSelectorProps {
  id?: string;
  value?: string | string[] | null;
  onChange?: (value: string | string[] | undefined) => void;
  onSelect?: (value: Organization[] | undefined) => void;
  selectedOptions?: Organization[];
  disabledIds?: string[];
  searchOnly?: boolean;
  antdSelectProps?: SelectProps;
}

export default function OrganizationSelector({
  id,
  value,
  onChange,
  onSelect,
  selectedOptions,
  disabledIds = [],
  searchOnly = false,
  antdSelectProps,
}: OrganizationSelectorProps) {
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const trimmedSearch = search.trim();
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(trimmedSearch), 300);
    return () => clearTimeout(timer);
  }, [trimmedSearch]);
  const waitingForSearch = searchOnly && !!trimmedSearch && keyword !== trimmedSearch;
  const { data, error, isLoading } = useSWR<List<Organization>, Error>(
    !searchOnly || (keyword && keyword === trimmedSearch)
      ? ["organization-selector", keyword]
      : null,
    ([, name]: [string, string]) =>
      OrganizationAPI.getOrganizationList({ current: 1, pageSize: 50, name: name || undefined }),
    { keepPreviousData: !searchOnly },
  );
  const { data: selected } = useSWR<Organization, Error>(
    typeof value === "string" && value && !selectedOptions?.some((item) => item.id === value)
      ? ["organization-selector-value", value]
      : null,
    async ([, id]: [string, string]) =>
      (await Axios.get<Organization>(`/cms/organization/${id}`)).data,
  );
  const organizations = uniqBy(
    [...(selectedOptions ?? []), ...(selected ? [selected] : []), ...(data?.records ?? [])],
    (organization) => organization.id,
  );
  const options = searchOnly ? (data?.records ?? []) : organizations;
  const clearSearch = () => {
    setSearch("");
    setKeyword("");
  };
  const handleChange = (selectedValue: string | string[] | undefined) => {
    onChange?.(selectedValue);
    const ids = Array.isArray(selectedValue) ? selectedValue : selectedValue ? [selectedValue] : [];
    onSelect?.(
      uniqBy(
        [
          ...(selectedOptions ?? []),
          ...organizations.filter((organization) => ids.includes(organization.id)),
        ],
        (organization) => organization.id,
      ),
    );
  };

  return (
    <Select
      placeholder="搜索组织"
      {...antdSelectProps}
      id={id}
      value={value}
      onChange={handleChange}
      onSelect={searchOnly ? clearSearch : antdSelectProps?.onSelect}
      onClear={searchOnly ? clearSearch : antdSelectProps?.onClear}
      options={options.map((organization) => ({
        value: organization.id,
        label: `${organization.name} (${organization.slug})${disabledIds.includes(organization.id) ? "（已添加）" : ""}`,
        disabled: disabledIds.includes(organization.id),
      }))}
      showSearch={{
        searchValue: searchOnly ? search : undefined,
        onSearch: setSearch,
        filterOption: false,
      }}
      loading={waitingForSearch || isLoading}
      status={error ? "error" : antdSelectProps?.status}
      notFoundContent={
        searchOnly && !trimmedSearch
          ? "输入关键词搜索"
          : error
            ? "加载失败，请重试"
            : waitingForSearch || isLoading
              ? "加载中…"
              : "没有匹配的结果"
      }
      labelRender={({ value, label }) =>
        organizations.find((organization) => organization.id === value)?.name ?? label
      }
    />
  );
}
