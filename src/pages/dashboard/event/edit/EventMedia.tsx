import { Organization } from "@/types/organization";
import { EventItem } from "@/types/event";
import { TextInput, Textarea, Fieldset } from "@mantine/core";
import { Image, Typography, Button, Flex, Row, Col, Tag } from "antd";
import { UseFormReturnType } from "@mantine/form";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import UploadImage from "@/components/UploadImage";

const { Title } = Typography;

interface EventMediaProps {
  form: UseFormReturnType<any>;
  event?: EventItem;
  selectedOrganization: Organization | null;
}

export default function EventMedia({ form, event, selectedOrganization }: EventMediaProps) {
  return (
    <div style={{ padding: "0 24px", margin: "16px 0" }}>
      <Title level={5}>展会媒体资源</Title>

      <Flex vertical gap={8}>
        <TextInput
          label="封面图片"
          withAsterisk
          {...form.getInputProps("thumbnail")}
        />
        <Flex gap={8} wrap="wrap">
          <Tag
            color="blue"
            style={{ cursor: "pointer" }}
            onClick={() =>
              form.setFieldValue("thumbnail", "fec-event-default-cover.png")
            }
          >
            默认图片
          </Tag>
          <Tag
            color="blue"
            style={{ cursor: "pointer" }}
            onClick={() =>
              form.setFieldValue("thumbnail", "fec-event-blank-cover.png")
            }
          >
            待揭晓图片
          </Tag>

          <Tag
            color="blue"
            style={{ cursor: "pointer" }}
            onClick={() =>
              form.setFieldValue("thumbnail", "fec-event-cancel-cover.png")
            }
          >
            取消图片
          </Tag>

          <UploadImage
            pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
            defaultImageName="cover"
            onUploadSuccess={(s) => form.setFieldValue("thumbnail", s)}
            disabled={!selectedOrganization?.slug || !form.values.slug}
          />
        </Flex>

        <Fieldset style={{ width: "100%" }} legend="展会详情图片">
          <Button
            size="small"
            icon={<IconPlus size={14} />}
            onClick={() =>
              form.setFieldValue(
                "media.images",
                form.values.media.images.concat({
                  url: "",
                  title: "",
                  description: "",
                })
              )
            }
          />
          {form.values.media.images.map((item: any, index: number) => (
            <div key={item.url} style={{ marginBottom: "1rem" }}>
              <Flex gap={16}>
                {selectedOrganization?.slug &&
                  form.values.slug &&
                  item.url && (
                    <Image
                      width={140}
                      height={340}
                      src={`https://images.furrycons.cn/${item.url}`}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                <Flex vertical flex={1} gap={8}>
                  <TextInput
                    label={`图片地址 ${index + 1}`}
                    placeholder="请输入图片地址"
                    {...form.getInputProps(`media.images.${index}.url`)}
                  />
                  <TextInput
                    label={`图片标题 ${index + 1}`}
                    placeholder="请输入图片标题（可选）"
                    {...form.getInputProps(`media.images.${index}.title`)}
                  />
                  <Textarea
                    label={`图片描述 ${index + 1}`}
                    placeholder="请输入图片描述（可选）"
                    autosize
                    minRows={2}
                    maxRows={4}
                    {...form.getInputProps(
                      `media.images.${index}.description`
                    )}
                  />
                  <UploadImage
                    pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
                    defaultImageName={`details-${index + 1}`}
                    onUploadSuccess={(s) =>
                      form.setFieldValue(`media.images.${index}.url`, s)
                    }
                    disabled={
                      !selectedOrganization?.slug || !form.values.slug
                    }
                  />
                  <Flex gap={4} justify="flex-end">
                    <Button
                      size="middle"
                      type="text"
                      icon={<IconArrowUp size={14} />}
                      onClick={() => {
                        if (index > 0) {
                          const items = [
                            ...(form.values.media.images || []),
                          ];
                          [items[index], items[index - 1]] = [
                            items[index - 1],
                            items[index],
                          ];
                          form.setFieldValue("media.images", items);
                        }
                      }}
                      disabled={index === 0}
                    />
                    <Button
                      size="middle"
                      type="text"
                      icon={<IconArrowDown size={14} />}
                      onClick={() => {
                        const items = [
                          ...(form.values.media.images || []),
                        ];
                        if (index < items.length - 1) {
                          [items[index], items[index + 1]] = [
                            items[index + 1],
                            items[index],
                          ];
                          form.setFieldValue("media.images", items);
                        }
                      }}
                      disabled={
                        index ===
                        (form.values.media.images || []).length - 1
                      }
                    />
                    <Button
                      size="middle"
                      danger
                      icon={<IconTrash size={14} />}
                      onClick={() =>
                        form.setFieldValue(
                          "media.images",
                          (form.values.media.images || []).filter(
                            (_: any, i: number) => i !== index
                          )
                        )
                      }
                    />
                  </Flex>
                </Flex>
              </Flex>
            </div>
          ))}
        </Fieldset>
      </Flex>
    </div>
  );
} 