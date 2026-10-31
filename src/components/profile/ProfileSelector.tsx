import { useEffect, useState } from "react";
import { Select, type SelectProps } from "antd";
import useSWR from "swr";
import Axios from "@/api";
import { ProfileAPI } from "@/api/cms/profile";
import type { Profile } from "@/types/profile";
import type { List } from "@/types/request";

interface ProfileSelectorProps {
  id?: string;
  value?: string | null;
  onChange?: (value?: string) => void;
  searchOnly?: boolean;
  antdSelectProps?: SelectProps;
}

export default function ProfileSelector({
  id,
  value,
  onChange,
  searchOnly = false,
  antdSelectProps,
}: ProfileSelectorProps) {
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const trimmedSearch = search.trim();
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(trimmedSearch), 300);
    return () => clearTimeout(timer);
  }, [trimmedSearch]);
  const waitingForSearch = searchOnly && !!trimmedSearch && keyword !== trimmedSearch;
  const { data, error, isLoading } = useSWR<List<Profile>, Error>(
    !searchOnly || (keyword && keyword === trimmedSearch) ? ["profile-selector", keyword] : null,
    ([, name]: [string, string]) =>
      ProfileAPI.list({ current: 1, pageSize: 50, name: name || undefined }),
    { keepPreviousData: !searchOnly },
  );
  const { data: selected } = useSWR<Profile, Error>(
    value ? ["profile-selector-value", value] : null,
    async ([, id]: [string, string]) => (await Axios.get<Profile>(`/cms/profile/${id}`)).data,
  );
  const records = data?.records ?? [];
  const options =
    !searchOnly && selected && !records.some((profile) => profile.id === selected.id)
      ? [selected, ...records]
      : records;
  const clearSearch = () => {
    setSearch("");
    setKeyword("");
  };

  return (
    <Select
      allowClear
      placeholder="搜索主体资料"
      {...antdSelectProps}
      id={id}
      value={value}
      onChange={(id: string | undefined) => onChange?.(id)}
      onSelect={searchOnly ? clearSearch : antdSelectProps?.onSelect}
      onClear={searchOnly ? clearSearch : antdSelectProps?.onClear}
      showSearch={{
        searchValue: searchOnly ? search : undefined,
        onSearch: setSearch,
        filterOption: false,
      }}
      loading={waitingForSearch || isLoading}
      status={error ? "error" : antdSelectProps?.status}
      options={options.map((profile) => ({
        value: profile.id,
        label: `${profile.name}${profile.slug ? `（${profile.slug}）` : ""}`,
      }))}
      labelRender={({ value, label }) =>
        selected?.id === value
          ? `${selected.name}${selected.slug ? `（${selected.slug}）` : ""}`
          : label
      }
      notFoundContent={
        searchOnly && !trimmedSearch
          ? "输入关键词搜索"
          : error
            ? "加载失败，请重试"
            : waitingForSearch || isLoading
              ? "加载中…"
              : "没有匹配的结果"
      }
    />
  );
}
