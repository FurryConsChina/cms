import { Button, DatePicker, Flex, Form, Input, Select } from "antd";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import { linkTypeLabels, toOptions } from "@/consts/labels";
import type { Dayjs } from "dayjs";

export function LinkFields({ name = "links", label = "联系方式与链接" }: { name?: string; label?: string }) {
  return (
    <Form.Item label={label}>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <div className="space-y-2">
            {fields.map((field) => (
              <Flex key={field.key} gap={8} align="start">
                <Form.Item
                  name={[field.name, "type"]}
                  rules={[{ required: true, message: "请选择类型" }]}
                  style={{ marginBottom: 0, flex: 1, minWidth: 0 }}
                >
                  <Select options={toOptions(linkTypeLabels)} />
                </Form.Item>
                <Form.Item name={[field.name, "label"]} noStyle>
                  <Input placeholder="显示名称（可选）" style={{ width: 160, flexShrink: 0 }} />
                </Form.Item>
                <Form.Item
                  name={[field.name, "value"]}
                  rules={[{ required: true, message: "请填写链接或号码" }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input placeholder="链接、群号或账号" />
                </Form.Item>
                <Button danger type="text" icon={<IconTrash size={16} />} onClick={() => remove(field.name)} />
              </Flex>
            ))}
            <Button type="dashed" block icon={<IconPlus size={16} />} onClick={() => add({ type: "website" })}>
              添加一条
            </Button>
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
}

export function IsoDateTimeInput({
  value,
  onChange,
}: {
  value?: string | null;
  onChange?: (value: string | null) => void;
}) {
  return (
    <DatePicker
      showTime
      style={{ width: "100%" }}
      value={value ? dayjs(value) : null}
      onChange={(v) => onChange?.(v?.toISOString() ?? null)}
    />
  );
}

export function DateListInput({ value, onChange }: { value?: string[] | null; onChange?: (value: string[]) => void }) {
  return (
    <DatePicker
      multiple
      value={(value ?? []).map((v) => dayjs(v))}
      style={{ width: "100%" }}
      format="YYYY-MM-DD"
      onChange={(dates: Dayjs[] | null) => onChange?.((dates ?? []).map((v) => v.format("YYYY-MM-DD")))}
    />
  );
}
