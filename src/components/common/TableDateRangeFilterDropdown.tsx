import { Button, DatePicker, Space } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import dayjs from "dayjs";

export default function TableDateRangeFilterDropdown({
  selectedKeys,
  setSelectedKeys,
  confirm,
  clearFilters,
  showTime = false,
}: FilterDropdownProps & { showTime?: boolean }) {
  const start = selectedKeys[0] ? dayjs(selectedKeys[0] as string) : null;
  const end = selectedKeys[1] ? dayjs(selectedKeys[1] as string) : null;

  return (
    <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
      <Space orientation="vertical">
        <DatePicker.RangePicker
          showTime={showTime}
          value={[start, end]}
          onChange={(dates) => {
            if (!dates?.[0] || !dates[1]) {
              setSelectedKeys([]);
              return;
            }
            setSelectedKeys([
              showTime ? dates[0].toISOString() : dates[0].startOf("day").toISOString(),
              showTime ? dates[1].toISOString() : dates[1].endOf("day").toISOString(),
            ]);
          }}
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
