import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import { Typography, Button, Flex, Row, Col, Form, Input, Card } from "antd";
import { EditEventSchema } from "@/types/event";
import { z } from "zod";

const { Title, Text } = Typography;

type EventFormValues = z.infer<typeof EditEventSchema>;

interface EventSourcesProps {
  form: UseFormReturn<EventFormValues>;
}

export default function EventSources({ form }: EventSourcesProps) {
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control: form.control,
    name: "sources",
  });
  return (
    <div>
      <Title level={5}>展会信息来源</Title>
      <Flex align="center" gap={8}>
        <Button icon={<IconPlus size={14} />} onClick={() => append({ name: "", url: "", description: "" })}>
          添加信息来源
        </Button>
      </Flex>

      {fields.map((field, index) => (
        <div key={field.id}>
          <Flex justify="space-between" align="center">
            <Text strong>信息来源 {index + 1}</Text>
            <Flex gap={4}>
              <Button
                icon={<IconArrowUp size={14} />}
                onClick={() => {
                  if (index > 0) {
                    move(index, index - 1);
                  }
                }}
                disabled={index === 0}
              />
              <Button
                icon={<IconArrowDown size={14} />}
                onClick={() => {
                  move(index, index + 1);
                }}
                disabled={index === fields.length - 1}
              />
              <Button danger icon={<IconTrash size={14} />} onClick={() => remove(index)} />
            </Flex>
          </Flex>
          <Row gutter={8} align="bottom">
            <Col flex={1}>
              <Form.Item
                label="名称"
                validateStatus={form.formState.errors.sources?.[index]?.name ? "error" : undefined}
                help={form.formState.errors.sources?.[index]?.name?.message}
              >
                <Controller
                  name={`sources.${index}.name`}
                  control={form.control}
                  render={({ field }) => (
                    <Input placeholder="信息来源名称" value={field.value || ""} onChange={field.onChange} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col flex={1}>
              <Form.Item
                label="链接"
                validateStatus={form.formState.errors.sources?.[index]?.url ? "error" : undefined}
                help={form.formState.errors.sources?.[index]?.url?.message}
              >
                <Controller
                  name={`sources.${index}.url`}
                  control={form.control}
                  render={({ field }) => (
                    <Input placeholder="信息来源链接" value={field.value || ""} onChange={field.onChange} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col flex={1}>
              <Form.Item
                label="描述"
                validateStatus={form.formState.errors.sources?.[index]?.description ? "error" : undefined}
                help={form.formState.errors.sources?.[index]?.description?.message}
              >
                <Controller
                  name={`sources.${index}.description`}
                  control={form.control}
                  render={({ field }) => (
                    <Input placeholder="信息来源描述（可选）" value={field.value || ""} onChange={field.onChange} />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ))}
    </div>
  );
}
