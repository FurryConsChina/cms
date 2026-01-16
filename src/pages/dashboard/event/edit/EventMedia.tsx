import { Organization } from "@/types/organization";
import { EventItem, EditEventSchema } from "@/types/event";
import { Image, Typography, Button, Flex, Row, Col, Tag, Form, Input, Card } from "antd";
import { useFieldArray, UseFormReturn, Controller } from "react-hook-form";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import { z } from "zod";
import UploadImage from "@/components/UploadImage";
import { IMAGE_FALLBACK } from "@/consts/normal";

const { Title, Text } = Typography;
const { TextArea } = Input;

type EventFormValues = z.infer<typeof EditEventSchema>;

interface EventMediaProps {
  form: UseFormReturn<EventFormValues>;
  pathPrefix: string;
  disabled: boolean;
}

export default function EventMedia({ form, pathPrefix, disabled }: EventMediaProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "media.images",
  });

  return (
    <div>
      <Title level={5}>展会媒体资源</Title>

      <Flex vertical gap={8}>
        <Form.Item
          label="封面图片"
          required
          validateStatus={form.formState.errors.thumbnail ? "error" : undefined}
          help={form.formState.errors.thumbnail?.message}
        >
          <Controller
            name="thumbnail"
            control={form.control}
            render={({ field }) => (
              <Input placeholder="请输入封面图片URL" disabled value={field.value} onChange={field.onChange} />
            )}
          />
          <Flex gap={8} wrap="wrap" className="mt-2">
            <Button
              color="blue"
              style={{ cursor: "pointer" }}
              onClick={() => {
                form.setValue("thumbnail", "fec-event-default-cover.png");
              }}
            >
              默认图片
            </Button>
            <Button
              color="blue"
              style={{ cursor: "pointer" }}
              onClick={() => form.setValue("thumbnail", "fec-event-blank-cover.png")}
            >
              待揭晓图片
            </Button>
            <Button
              color="blue"
              style={{ cursor: "pointer" }}
              onClick={() => form.setValue("thumbnail", "fec-event-cancel-cover.png")}
            >
              取消图片
            </Button>

            <UploadImage
              pathPrefix={pathPrefix}
              defaultImageName="cover"
              onUploadSuccess={(s) => form.setValue("thumbnail", s)}
              disabled={disabled}
            />
          </Flex>
        </Form.Item>

        <Flex align="center" gap={8}>
          <Form.Item label="展会详情图片" className="mb-0">
            <Button
              icon={<IconPlus size={14} />}
              onClick={() =>
                append({
                  url: "",
                  title: "",
                  description: "",
                })
              }
            >
              添加详情图片
            </Button>
          </Form.Item>
        </Flex>
        {fields.map((field, index) => (
          <div key={field.id} style={{ marginBottom: "1rem" }}>
            <Title level={5}>第{index + 1}张图片</Title>
            <Flex gap={16}>
              {
                <Image
                  width={140}
                  height={340}
                  src={`https://images.furrycons.cn/${field.url}`}
                  style={{ objectFit: "cover" }}
                  fallback={IMAGE_FALLBACK}
                />
              }
              <Flex vertical flex={1}>
                <Form.Item
                  label={`图片地址 ${index + 1}`}
                  validateStatus={form.formState.errors.media?.images?.[index]?.url ? "error" : undefined}
                  help={form.formState.errors.media?.images?.[index]?.url?.message}
                >
                  <Controller
                    name={`media.images.${index}.url`}
                    control={form.control}
                    render={({ field }) => (
                      <Input placeholder="请输入图片地址" value={field.value || ""} onChange={field.onChange} />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={`图片标题 ${index + 1}`}
                  validateStatus={form.formState.errors.media?.images?.[index]?.title ? "error" : undefined}
                  help={form.formState.errors.media?.images?.[index]?.title?.message}
                >
                  <Controller
                    name={`media.images.${index}.title`}
                    control={form.control}
                    render={({ field }) => (
                      <Input placeholder="请输入图片标题（可选）" value={field.value || ""} onChange={field.onChange} />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={`图片描述 ${index + 1}`}
                  validateStatus={form.formState.errors.media?.images?.[index]?.description ? "error" : undefined}
                  help={form.formState.errors.media?.images?.[index]?.description?.message}
                >
                  <Controller
                    name={`media.images.${index}.description`}
                    control={form.control}
                    render={({ field }) => (
                      <TextArea
                        placeholder="请输入图片描述（可选）"
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Form.Item>
                <UploadImage
                  pathPrefix={pathPrefix}
                  defaultImageName={`details-${index + 1}`}
                  onUploadSuccess={(s) => form.setValue(`media.images.${index}.url`, s)}
                  disabled={disabled}
                />
                <Flex gap={4} justify="flex-end" className="mt-2">
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
            </Flex>
          </div>
        ))}
      </Flex>
    </div>
  );
}
