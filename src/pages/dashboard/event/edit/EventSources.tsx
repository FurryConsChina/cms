import { useFieldArray, UseFormReturn } from "react-hook-form";
import {
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Typography, Button, Flex, Row, Col, Form, Input, Card } from "antd";
import { EditEventSchema } from "@/types/event";
import { z } from "zod";

const { Title, Text } = Typography;

type EventFormValues = z.infer<typeof EditEventSchema>;

interface EventSourcesProps {
  form: UseFormReturn<EventFormValues>;
}

export default function EventSources({ form }: EventSourcesProps) {
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control: form.control,
      name: "sources",
    }
  );
  return (
    <div>
      <Title level={5}>展会信息来源</Title>
      <Flex vertical gap={8}>
        <Flex align="center" gap={8}>
          <Button
            size="small"
            icon={<IconPlus size={14} />}
            onClick={() => append({ name: "", url: "", description: "" })}
          />
          <Text type="secondary" style={{ fontSize: 14 }}>
            添加信息来源
          </Text>
        </Flex>

        {fields.map((field, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <Card title={`信息来源 ${index + 1}`}>
              <Row gutter={8} align="bottom">
                <Col flex={1}>
                  <Form.Item
                    label="名称"
                    validateStatus={
                      form.formState.errors.sources?.[index]?.name
                        ? "error"
                        : undefined
                    }
                    help={form.formState.errors.sources?.[index]?.name?.message}
                  >
                    <Input
                      placeholder="信息来源名称"
                      {...form.register(`sources.${index}.name`)}
                    />
                  </Form.Item>
                </Col>
                <Col flex={1}>
                  <Form.Item
                    label="链接"
                    validateStatus={
                      form.formState.errors.sources?.[index]?.url
                        ? "error"
                        : undefined
                    }
                    help={form.formState.errors.sources?.[index]?.url?.message}
                  >
                    <Input
                      placeholder="信息来源链接"
                      {...form.register(`sources.${index}.url`)}
                    />
                  </Form.Item>
                </Col>
                <Col flex={1}>
                  <Form.Item
                    label="描述"
                    validateStatus={
                      form.formState.errors.sources?.[index]?.description
                        ? "error"
                        : undefined
                    }
                    help={
                      form.formState.errors.sources?.[index]?.description
                        ?.message
                    }
                  >
                    <Input
                      placeholder="信息来源描述（可选）"
                      {...form.register(`sources.${index}.description`)}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Flex gap={4}>
                    <Button
                      size="small"
                      type="text"
                      icon={<IconArrowUp size={14} />}
                      onClick={() => {
                        if (index > 0) {
                          move(index, index - 1)
                        }
                      }}
                      disabled={index === 0}
                    />
                    <Button
                      size="small"
                      type="text"
                      icon={<IconArrowDown size={14} />}
                      onClick={() => {
                        move(index, index + 1)
                      }}
                      disabled={index === fields.length - 1}
                    />
                    <Button
                      size="small"
                      danger
                      icon={<IconTrash size={14} />}
                      onClick={() => remove(index)}
                    />
                  </Flex>
                </Col>
              </Row>
            </Card>
          </div>
        ))}
      </Flex>
    </div>
  );
}
