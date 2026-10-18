import { useEffect, useState } from "react";
import { Select } from "antd";
import useSWR from "swr";
import Axios from "@/api";
import type { List } from "@/types/request";

type EntityKind = "event" | "organization" | "profile" | "region";
type OptionRecord = { id: string; name: string; slug?: string };

const listEndpoint = (kind: EntityKind) =>
  `/cms/${kind}${kind === "event" || kind === "organization" ? "/list" : ""}`;
const detailEndpoint = (kind: EntityKind, id: string) =>
  `/cms/${kind}${kind === "event" ? "/detail" : ""}/${id}`;

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function EntitySelect({
  id,
  kind,
  value,
  onChange,
  disabled,
  placeholder,
  style,
}: {
  id?: string;
  kind: EntityKind;
  value?: string | null;
  onChange?: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const [search, setSearch] = useState("");
  const keyword = useDebounced(search.trim());
  const { data, isLoading, error } = useSWR(
    ["entity-options", kind, keyword],
    async () =>
      (
        await Axios.get<List<OptionRecord>>(listEndpoint(kind), {
          params: {
            current: 1,
            pageSize: 50,
            [kind === "event" || kind === "region" ? "search" : "name"]: keyword || undefined,
          },
        })
      ).data,
    { keepPreviousData: true },
  );
  const { data: selected } = useSWR(
    value ? ["entity-option", kind, value] : null,
    async () => (await Axios.get<OptionRecord>(detailEndpoint(kind, value!))).data,
  );
  const records = data?.records ?? [];
  const options =
    selected && !records.some((v) => v.id === selected.id) ? [selected, ...records] : records;
  return (
    <Select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(v) => onChange?.(v ?? null)}
      allowClear
      loading={isLoading}
      status={error ? "error" : undefined}
      showSearch={{ onSearch: setSearch, filterOption: false }}
      options={options.map((v) => ({
        value: v.id,
        label: `${v.name}${v.slug ? `（${v.slug}）` : ""}`,
      }))}
      placeholder={placeholder ?? (kind === "region" ? "输入名称或代码搜索" : "输入名称搜索")}
      notFoundContent={error ? "加载失败，请重试" : isLoading ? "加载中…" : "没有匹配的结果"}
      style={{ minWidth: 220, ...style }}
    />
  );
}
