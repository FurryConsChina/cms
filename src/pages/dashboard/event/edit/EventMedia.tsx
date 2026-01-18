import { Image, Typography, Button, Flex, Form, Input, Space, Col, Row } from "antd";
import type { FormInstance } from "antd";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import UploadImage from "@/components/UploadImage";
import { IMAGE_FALLBACK } from "@/consts/normal";
import { EventDefaultThumbnail } from "@/consts/event";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface EventMediaProps {
  form: FormInstance;
  pathPrefix: string;
  disabled: boolean;
}

export default function EventMedia({ form, pathPrefix, disabled }: EventMediaProps) {
  return (
    <div>
      <Title level={5} style={{ margin: "12px 0" }}>
        展会媒体资源
      </Title>

      <Row gutter={8} justify="space-between">
        <Col>
          <Form.Item
            name="thumbnail"
            getValueProps={(value) => ({ src: `https://images.furrycons.cn/${value}?format=jpg` })}
          >
            <Image width={140} style={{ objectFit: "cover" }} fallback={IMAGE_FALLBACK} />
          </Form.Item>
        </Col>
        <Col flex={1}>
          <Form.Item
            label="封面图片"
            required
            name="thumbnail"
            rules={[{ required: true, message: "请上传活动海报，或者选一个默认海报" }]}
            extra={
              <Space style={{ marginTop: 8 }} wrap>
                <Button
                  onClick={() => {
                    form.setFieldValue("thumbnail", EventDefaultThumbnail.default);
                  }}
                >
                  默认图片
                </Button>
                <Button onClick={() => form.setFieldValue("thumbnail", EventDefaultThumbnail.blank)}>待揭晓图片</Button>
                <Button onClick={() => form.setFieldValue("thumbnail", EventDefaultThumbnail.cancel)}>取消图片</Button>

                <UploadImage
                  pathPrefix={pathPrefix}
                  defaultImageName="cover"
                  onUploadSuccess={(s) => form.setFieldValue("thumbnail", s)}
                  disabled={disabled}
                />
              </Space>
            }
          >
            <Input placeholder="请输入封面图片URL" disabled />
          </Form.Item>
        </Col>
      </Row>

      <Form.List name={["media", "images"]}>
        {(fields, { add, remove, move }) => (
          <>
            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
              <Text strong>展会详情图片</Text>
              <Button
                icon={<IconPlus size={14} />}
                onClick={() =>
                  add({
                    url: "",
                    title: "",
                    description: "",
                  })
                }
              >
                添加详情图片
              </Button>
            </Flex>
            {fields.map((field, index) => {
              return (
                <div key={field.key}>
                  <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                    <Text strong>第{index + 1}张图片</Text>
                    <Flex gap={4} justify="flex-center">
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
                  <Flex className="md:flex-row flex-col" gap={16}>
                    <Form.Item
                      name={[field.name, "url"]}
                      className="mb-0"
                      getValueProps={(value) => ({ src: `https://images.furrycons.cn/${value}?format=jpg` })}
                    >
                      <Image
                        className="w-lvw h-30 md:w-[140] md:h-[340]"
                        style={{ objectFit: "cover" }}
                        fallback={IMAGE_FALLBACK}
                      />
                    </Form.Item>
                    <Flex vertical flex={1}>
                      <Form.Item
                        label={`图片地址 ${index + 1}`}
                        name={[field.name, "url"]}
                        rules={[{ required: true, message: "请输入图片地址" }]}
                      >
                        <Input placeholder="请输入图片地址" />
                      </Form.Item>
                      <Form.Item label={`图片标题 ${index + 1}`} name={[field.name, "title"]}>
                        <Input placeholder="请输入图片标题（可选）" />
                      </Form.Item>
                      <Form.Item label={`图片描述 ${index + 1}`} name={[field.name, "description"]}>
                        <TextArea placeholder="请输入图片描述（可选）" autoSize={{ minRows: 2, maxRows: 4 }} />
                      </Form.Item>
                      <UploadImage
                        pathPrefix={pathPrefix}
                        defaultImageName={`details-${index + 1}`}
                        onUploadSuccess={(s) => form.setFieldValue(["media", "images", field.name, "url"], s)}
                        disabled={disabled}
                      />
                    </Flex>
                  </Flex>
                </div>
              );
            })}
          </>
        )}
      </Form.List>
    </div>
  );
}
