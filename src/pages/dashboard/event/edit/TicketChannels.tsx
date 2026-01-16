import { Fieldset, Select, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import { Typography, Button, Flex, Row, Col } from "antd";

const { Title, Text } = Typography;

interface TicketChannelsProps {
  form: UseFormReturnType<any>;
}

export default function TicketChannels({ form }: TicketChannelsProps) {
  return (
    <div style={{ padding: "0 24px", margin: "16px 0" }}>
      <Title level={5}>票务渠道</Title>
      <Flex vertical gap={8}>
        <Flex align="center" gap={8}>
          <Button
            size="small"
            icon={<IconPlus size={14} />}
            onClick={() =>
              form.setFieldValue("ticketChannels", [
                ...(form.values.ticketChannels || []),
                {
                  type: "url",
                  name: "",
                  url: "",
                  available: true,
                },
              ])
            }
          />
          <Text type="secondary" style={{ fontSize: 14 }}>
            添加票务渠道
          </Text>
        </Flex>

        {(form.values.ticketChannels || []).map((channel: any, index: number) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <Fieldset legend={`票务渠道 ${index + 1}`}>
              <Flex vertical gap={8}>
                <Row gutter={8} align="bottom">
                  <Col flex={1}>
                    <Select
                      label="渠道类型"
                      placeholder="选择渠道类型"
                      data={[
                        { label: "微信小程序", value: "wxMiniProgram" },
                        { label: "网页链接", value: "url" },
                        { label: "二维码", value: "qrcode" },
                        { label: "APP", value: "app" },
                      ]}
                      {...form.getInputProps(`ticketChannels.${index}.type`)}
                    />
                  </Col>
                  <Col flex={1}>
                    <TextInput
                      label="渠道名称"
                      placeholder="票务渠道名称"
                      {...form.getInputProps(`ticketChannels.${index}.name`)}
                    />
                  </Col>
                  <Col flex={1}>
                    <TextInput
                      label="渠道链接/地址/描述"
                      placeholder="渠道链接或地址或描述"
                      {...form.getInputProps(`ticketChannels.${index}.url`)}
                    />
                  </Col>
                  <Col flex={1}>
                    <Select
                      label="可用状态"
                      placeholder="选择状态"
                      data={[
                        { label: "可用", value: "true" },
                        { label: "不可用", value: "false" },
                      ]}
                      value={
                        form.values.ticketChannels?.[
                          index
                        ]?.available?.toString() || "true"
                      }
                      onChange={(value) => {
                        const boolValue =
                          value === "true"
                            ? true
                            : value === "false"
                            ? false
                            : null;
                        form.setFieldValue(
                          `ticketChannels.${index}.available`,
                          boolValue
                        );
                      }}
                    />
                  </Col>
                </Row>
                <Flex justify="flex-end" gap={4}>
                  <Button
                    size="small"
                    type="text"
                    icon={<IconArrowUp size={14} />}
                    onClick={() => {
                      if (index > 0) {
                        const items = [
                          ...(form.values.ticketChannels || []),
                        ];
                        [items[index], items[index - 1]] = [
                          items[index - 1],
                          items[index],
                        ];
                        form.setFieldValue("ticketChannels", items);
                      }
                    }}
                    disabled={index === 0}
                  />
                  <Button
                    size="small"
                    type="text"
                    icon={<IconArrowDown size={14} />}
                    onClick={() => {
                      const items = [...(form.values.ticketChannels || [])];
                      if (index < items.length - 1) {
                        [items[index], items[index + 1]] = [
                          items[index + 1],
                          items[index],
                        ];
                        form.setFieldValue("ticketChannels", items);
                      }
                    }}
                    disabled={
                      index ===
                      (form.values.ticketChannels || []).length - 1
                    }
                  />
                  <Button
                    size="small"
                    danger
                    icon={<IconTrash size={14} />}
                    onClick={() =>
                      form.setFieldValue(
                        "ticketChannels",
                        (form.values.ticketChannels || []).filter(
                          (_: any, i: number) => i !== index
                        )
                      )
                    }
                  />
                </Flex>
              </Flex>
            </Fieldset>
          </div>
        ))}
      </Flex>
    </div>
  );
} 