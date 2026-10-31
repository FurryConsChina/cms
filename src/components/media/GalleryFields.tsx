import { Button, Flex, Form, Input, Space, Typography } from "antd";
import { IconArrowDown, IconArrowUp, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import MediaPicker from "@/components/media/MediaPicker";
import type { MediaBinding } from "@/types/media";

export default function GalleryFields({
  name,
  label,
  onBusyChange,
  disabled,
}: {
  name: string;
  label: string;
  onBusyChange?: (key: string, busy: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove, move }) => (
        <div className="my-3 space-y-3">
          <Flex justify="space-between" align="center" gap={12}>
            <Space size={8}>
              <Typography.Text>{label}</Typography.Text>
              {fields.length > 0 && (
                <Typography.Text type="secondary">{fields.length} 张图片</Typography.Text>
              )}
            </Space>
            <Button
              type="dashed"
              size="small"
              icon={<IconPhotoPlus size={16} stroke={1.5} />}
              disabled={disabled}
              onClick={() => add({})}
            >
              添加图片
            </Button>
          </Flex>

          {fields.length === 0 ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => add({})}
              className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconPhotoPlus size={30} stroke={1.25} />
              <span>相册还没有图片</span>
              <span className="text-sm text-slate-400">添加第一张图片</span>
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {fields.map((field, index) => (
                <div key={field.key} className="overflow-hidden rounded-xl bg-slate-100/60">
                  <div className="p-2 pb-0">
                    <Form.Item
                      name={field.name}
                      className="mb-0"
                      rules={[
                        {
                          validator: (_, value: MediaBinding | undefined) =>
                            value?.mediaAssetId
                              ? Promise.resolve()
                              : Promise.reject(new Error("请选择图片")),
                        },
                      ]}
                    >
                      <MediaPicker
                        variant="gallery"
                        onBusyChange={onBusyChange}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </div>

                  <div className="space-y-2 p-2">
                    <Form.Item name={[field.name, "title"]} noStyle>
                      <Input size="small" placeholder="图片标题（可选）" />
                    </Form.Item>
                    <Form.Item name={[field.name, "description"]} noStyle>
                      <Input.TextArea
                        size="small"
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        placeholder="图片描述（可选）"
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, "altText"]} noStyle>
                      <Input size="small" placeholder="替代文本（可选）" />
                    </Form.Item>
                    <Flex justify="space-between" align="center" gap={8}>
                      <Typography.Text type="secondary" className="text-xs">
                        第 {index + 1} 张
                      </Typography.Text>
                      <Space size={0}>
                        <Button
                          type="text"
                          size="small"
                          icon={<IconArrowUp size={16} stroke={1.5} />}
                          aria-label={`上移第 ${index + 1} 张图片`}
                          disabled={disabled || !index}
                          onClick={() => move(index, index - 1)}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<IconArrowDown size={16} stroke={1.5} />}
                          aria-label={`下移第 ${index + 1} 张图片`}
                          disabled={disabled || index === fields.length - 1}
                          onClick={() => move(index, index + 1)}
                        />
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<IconTrash size={16} stroke={1.5} />}
                          disabled={disabled}
                          onClick={() => remove(field.name)}
                        >
                          删除
                        </Button>
                      </Space>
                    </Flex>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Form.List>
  );
}
