import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import { Typography, Button, Flex, Row, Col, Form, Select, Input } from "antd";
import type { FormInstance } from "antd";

const { Title, Text } = Typography;

interface TicketChannelsProps {
  form: FormInstance;
}

export default function TicketChannels({ form }: TicketChannelsProps) {
  return (
    <div>
      <Form.List name="ticketChannels">
        {(fields, { add, remove, move }) => (
          <>
            <Flex justify="space-between" align="center">
              <Title level={5} style={{ margin: "12px 0" }}>
                票务渠道
              </Title>
              <Button
                icon={<IconPlus size={14} />}
                onClick={() =>
                  add({
                    type: "url",
                    name: "",
                    url: "",
                    available: true,
                  })
                }
              >
                添加票务渠道
              </Button>
            </Flex>

            {fields.map((field, index) => (
              <div key={field.key}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                  <Text strong>票务渠道 {index + 1}</Text>
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
                    <Button danger icon={<IconTrash size={14} />} onClick={() => remove(field.name)} />
                  </Flex>
                </Flex>
                <Row gutter={8} align="bottom">
                  <Col span={4}>
                    <Form.Item
                      label="渠道类型"
                      name={[field.name, "type"]}
                      rules={[{ required: true, message: "请选择渠道类型" }]}
                    >
                      <Select
                        placeholder="选择渠道类型"
                        options={[
                          { label: "网页链接", value: "url" },
                          { label: "微信小程序", value: "wxMiniProgram" },
                          { label: "二维码", value: "qrcode" },
                          { label: "APP", value: "app" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="渠道名称"
                      name={[field.name, "name"]}
                      rules={[{ required: true, message: "请输入渠道名称" }]}
                    >
                      <Input placeholder="票务渠道名称" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="渠道链接/地址/描述"
                      name={[field.name, "url"]}
                      rules={[{ required: true, message: "请输入渠道链接" }]}
                    >
                      <Input placeholder="渠道链接或地址或描述" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      label="票务状态"
                      name={[field.name, "available"]}
                      rules={[{ required: true, message: "请选择票务状态" }]}
                    >
                      <Select
                        placeholder="选择票务状态"
                        options={[
                          { label: "可售", value: true },
                          { label: "停售", value: false },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
          </>
        )}
      </Form.List>
    </div>
  );
}
