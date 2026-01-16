import { useFieldArray, UseFormReturn, Controller } from "react-hook-form";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import { Typography, Button, Flex, Row, Col, Form, Select, Input, Card } from "antd";
import { EditEventSchema } from "@/types/event";
import { z } from "zod";

const { Title, Text } = Typography;

type EventFormValues = z.infer<typeof EditEventSchema>;

interface TicketChannelsProps {
  form: UseFormReturn<EventFormValues>;
}

export default function TicketChannels({ form }: TicketChannelsProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "ticketChannels",
  });
  return (
    <div>
      <Title level={5}>票务渠道</Title>
      <Flex vertical gap={8}>
        <Flex align="center" gap={8}>
          <Button
            size="small"
            icon={<IconPlus size={14} />}
            onClick={() =>
              append({
                type: "url",
                name: "",
                url: "",
                available: true,
              })
            }
          />
          <Text type="secondary" style={{ fontSize: 14 }}>
            添加票务渠道
          </Text>
        </Flex>

        {fields.map((field, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <Card title={`票务渠道 ${index + 1}`}>
              <Row gutter={8} align="bottom">
                  <Col flex={1}>
                    <Form.Item
                      label="渠道类型"
                      validateStatus={form.formState.errors.ticketChannels?.[index]?.type ? "error" : undefined}
                      help={form.formState.errors.ticketChannels?.[index]?.type?.message}
                    >
                      <Controller
                        name={`ticketChannels.${index}.type`}
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            placeholder="选择渠道类型"
                            options={[
                              { label: "微信小程序", value: "wxMiniProgram" },
                              { label: "网页链接", value: "url" },
                              { label: "二维码", value: "qrcode" },
                              { label: "APP", value: "app" },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex={1}>
                    <Form.Item
                      label="渠道名称"
                      validateStatus={form.formState.errors.ticketChannels?.[index]?.name ? "error" : undefined}
                      help={form.formState.errors.ticketChannels?.[index]?.name?.message}
                    >
                      <Controller
                        name={`ticketChannels.${index}.name`}
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            placeholder="票务渠道名称"
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex={1}>
                    <Form.Item
                      label="渠道链接/地址/描述"
                      validateStatus={form.formState.errors.ticketChannels?.[index]?.url ? "error" : undefined}
                      help={form.formState.errors.ticketChannels?.[index]?.url?.message}
                    >
                      <Controller
                        name={`ticketChannels.${index}.url`}
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            placeholder="渠道链接或地址或描述"
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex={1}>
                    <Form.Item
                      label="可用状态"
                      validateStatus={form.formState.errors.ticketChannels?.[index]?.available ? "error" : undefined}
                      help={form.formState.errors.ticketChannels?.[index]?.available?.message}
                    >
                      <Controller
                        name={`ticketChannels.${index}.available`}
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            placeholder="选择状态"
                            options={[
                              { label: "可用", value: "true" },
                              { label: "不可用", value: "false" },
                            ]}
                            value={field.value?.toString() || "true"}
                            onChange={(value) => {
                              const boolValue =
                                value === "true"
                                  ? true
                                  : value === "false"
                                  ? false
                                  : null;
                              field.onChange(boolValue);
                            }}
                          />
                        )}
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
                            move(index, index - 1);
                          }
                        }}
                        disabled={index === 0}
                      />
                      <Button
                        size="small"
                        type="text"
                        icon={<IconArrowDown size={14} />}
                        onClick={() => {
                          move(index, index + 1);
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