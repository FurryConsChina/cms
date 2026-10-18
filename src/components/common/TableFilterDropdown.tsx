import { Button, Input, Space } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import EntitySelect from "./EntitySelect";

export default function TableFilterDropdown({
  selectedKeys,
  setSelectedKeys,
  confirm,
  clearFilters,
  placeholder,
  confirmText = "筛选",
  region = false,
}: FilterDropdownProps & { placeholder: string; confirmText?: string; region?: boolean }) {
  const value = selectedKeys[0] as string | undefined;
  const apply = () => {
    const trimmed = value?.trim();
    setSelectedKeys(trimmed ? [trimmed] : []);
    confirm();
  };

  return (
    <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
      <Space orientation="vertical">
        {region ? (
          <EntitySelect
            kind="region"
            value={value}
            onChange={(id) => setSelectedKeys(id ? [id] : [])}
            placeholder={placeholder}
            style={{ width: 240 }}
          />
        ) : (
          <Input
            allowClear
            value={value ?? ""}
            onChange={(event) => setSelectedKeys(event.target.value ? [event.target.value] : [])}
            onPressEnter={apply}
            placeholder={placeholder}
            style={{ width: 240 }}
          />
        )}
        <Space>
          <Button type="primary" size="small" onClick={apply}>
            {confirmText}
          </Button>
          <Button
            size="small"
            onClick={() => clearFilters?.({ confirm: true, closeDropdown: true })}
          >
            重置
          </Button>
        </Space>
      </Space>
    </div>
  );
}
