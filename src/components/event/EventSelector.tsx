import { useEffect, useState } from "react";
import { Select, type SelectProps } from "antd";
import useSWR from "swr";
import Axios from "@/api";
import { EventAPI } from "@/api/cms/event";
import type { EventItem, EventResponse } from "@/types/event";
import type { List } from "@/types/request";

interface EventSelectorProps {
  id?: string;
  value?: string | null;
  onChange?: (value?: string) => void;
  antdSelectProps?: SelectProps;
}

export default function EventSelector({
  id,
  value,
  onChange,
  antdSelectProps,
}: EventSelectorProps) {
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const trimmedSearch = search.trim();
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(trimmedSearch), 300);
    return () => clearTimeout(timer);
  }, [trimmedSearch]);
  const waitingForSearch = !!trimmedSearch && keyword !== trimmedSearch;
  const { data, error, isLoading } = useSWR<List<EventItem>, Error>(
    keyword && keyword === trimmedSearch ? ["event-selector", keyword] : null,
    ([, search]: [string, string]) => EventAPI.getEventList({ current: 1, pageSize: 50, search }),
  );
  const { data: selected } = useSWR<EventResponse, Error>(
    value ? ["event-selector-value", value] : null,
    async ([, id]: [string, string]) =>
      (await Axios.get<EventResponse>(`/cms/event/detail/${id}`)).data,
  );
  const records = data?.records ?? [];
  const clearSearch = () => {
    setSearch("");
    setKeyword("");
  };

  return (
    <Select
      allowClear
      placeholder="搜索活动"
      {...antdSelectProps}
      id={id}
      value={value}
      onChange={(id: string | undefined) => onChange?.(id)}
      onSelect={clearSearch}
      onClear={clearSearch}
      showSearch={{ searchValue: search, onSearch: setSearch, filterOption: false }}
      loading={waitingForSearch || isLoading}
      status={error ? "error" : antdSelectProps?.status}
      options={records.map((event) => ({
        value: event.id,
        label: `${event.name}${event.slug ? `（${event.slug}）` : ""}`,
      }))}
      labelRender={({ value, label }) =>
        selected?.id === value
          ? `${selected.name}${selected.slug ? `（${selected.slug}）` : ""}`
          : label
      }
      notFoundContent={
        !trimmedSearch
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
