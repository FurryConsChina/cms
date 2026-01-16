import { TextInput, Fieldset } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import { Typography, Button, Flex, Row, Col } from "antd";

const { Title, Text } = Typography;

interface EventSourcesProps {
  form: UseFormReturnType<any>;
}

export default function EventSources({ form }: EventSourcesProps) {
  return (
    <div style={{ padding: "0 24px", margin: "16px 0" }}>
      <Title level={5}>展会信息来源</Title>
      <Flex vertical gap={8}>
        <Flex align="center" gap={8}>
          <Button
            size="small"
            icon={<IconPlus size={14} />}
            onClick={() =>
              form.setFieldValue("sources", [
                ...(form.values.sources || []),
                { name: "", url: "", description: "" },
              ])
            }
          />
          <Text type="secondary" style={{ fontSize: 14 }}>
            添加信息来源
          </Text>
        </Flex>

        {(form.values.sources || []).map((source: any, index: number) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <Fieldset legend={`信息来源 ${index + 1}`}>
              <Row gutter={8} align="bottom">
                <Col flex={1}>
                  <TextInput
                    label="名称"
                    placeholder="信息来源名称"
                    {...form.getInputProps(`sources.${index}.name`)}
                  />
                </Col>
                <Col flex={1}>
                  <TextInput
                    label="链接"
                    placeholder="信息来源链接"
                    {...form.getInputProps(`sources.${index}.url`)}
                  />
                </Col>
                <Col flex={1}>
                  <TextInput
                    label="描述"
                    placeholder="信息来源描述（可选）"
                    {...form.getInputProps(`sources.${index}.description`)}
                  />
                </Col>
                <Col>
                  <Flex gap={4}>
                    <Button
                      size="small"
                      type="text"
                      icon={<IconArrowUp size={14} />}
                      onClick={() => {
                        if (index > 0) {
                          const items = [...(form.values.sources || [])];
                          [items[index], items[index - 1]] = [
                            items[index - 1],
                            items[index],
                          ];
                          form.setFieldValue("sources", items);
                        }
                      }}
                      disabled={index === 0}
                    />
                    <Button
                      size="small"
                      type="text"
                      icon={<IconArrowDown size={14} />}
                      onClick={() => {
                        const items = [...(form.values.sources || [])];
                        if (index < items.length - 1) {
                          [items[index], items[index + 1]] = [
                            items[index + 1],
                            items[index],
                          ];
                          form.setFieldValue("sources", items);
                        }
                      }}
                      disabled={
                        index === (form.values.sources || []).length - 1
                      }
                    />
                    <Button
                      size="small"
                      danger
                      icon={<IconTrash size={14} />}
                      onClick={() =>
                        form.setFieldValue(
                          "sources",
                          (form.values.sources || []).filter(
                            (_: any, i: number) => i !== index
                          )
                        )
                      }
                    />
                  </Flex>
                </Col>
              </Row>
            </Fieldset>
          </div>
        ))}
      </Flex>
    </div>
  );
} 