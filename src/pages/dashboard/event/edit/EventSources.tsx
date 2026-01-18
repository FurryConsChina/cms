import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import { Typography, Button, Flex, Row, Col, Form, Input } from "antd";
import type { FormInstance } from "antd";

const { Title, Text } = Typography;

interface EventSourcesProps {
  form: FormInstance;
}

export default function EventSources({ form }: EventSourcesProps) {
  return (
    <div>
      <Form.List name="sources">
        {(fields, { add, remove, move }) => (
          <>
            <Title level={5} style={{ margin: "12px 0" }}>
              <Flex justify="space-between" align="center">
                展会信息来源
                <Button icon={<IconPlus size={14} />} onClick={() => add({ name: "", url: "", description: "" })}>
                  添加来源
                </Button>
              </Flex>
            </Title>

            {fields.map((field, index) => (
              <div key={field.key}>
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
                    <Button danger icon={<IconTrash size={14} />} onClick={() => remove(field.name)} />
                  </Flex>
                </Flex>
                <Row gutter={8} align="bottom">
                  <Col span={4}>
                    <Form.Item
                      label="名称"
                      name={[field.name, "name"]}
                      rules={[{ required: true, message: "请输入信息来源名称" }]}
                    >
                      <Input placeholder="信息来源名称" />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      label="链接"
                      name={[field.name, "url"]}
                      rules={[{ required: true, message: "请输入信息来源链接" }]}
                    >
                      <Input placeholder="信息来源链接" />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item label="描述" name={[field.name, "description"]}>
                      <Input placeholder="信息来源描述" />
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
