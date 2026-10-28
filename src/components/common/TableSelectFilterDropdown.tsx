import { Button, Select, Space } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";

export default function TableSelectFilterDropdown({
  selectedKeys,
  setSelectedKeys,
  confirm,
  clearFilters,
  options,
  placeholder,
}: FilterDropdownProps & {
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
      <Space orientation="vertical">
        <Select
          allowClear
          showSearch={{ optionFilterProp: "label" }}
          placeholder={placeholder}
          options={options}
          value={selectedKeys[0] as string | undefined}
          onChange={(value) => setSelectedKeys(value ? [value] : [])}
          style={{ width: 240 }}
        />
        <Space>
          <Button type="primary" size="small" onClick={() => confirm({ closeDropdown: true })}>
            筛选
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
