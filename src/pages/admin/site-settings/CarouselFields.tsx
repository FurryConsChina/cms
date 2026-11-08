import { Button, Empty, Flex, Form, Input, Space, Typography } from "antd";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import MediaPicker from "@/components/media/MediaPicker";
import type { MediaBinding } from "@/types/media";

export default function CarouselFields({
  disabled,
  onBusyChange,
}: {
  disabled: boolean;
  onBusyChange: (key: string, busy: boolean) => void;
}) {
  return (
    <Form.List
      name="items"
      rules={[
        {
          validator: (_, items: unknown[]) =>
            items.length <= 20
              ? Promise.resolve()
              : Promise.reject(new Error("最多添加 20 张轮播图")),
        },
      ]}
    >
      {(fields, { add, remove, move }, { errors }) => (
        <div className="space-y-4">
          <Flex justify="space-between" align="center" wrap gap={12}>
            <Typography.Text type="secondary">
              按列表顺序展示，已添加 {fields.length} / 20 张。
            </Typography.Text>
            <Button
              icon={<IconPlus size={16} stroke={1.5} />}
              disabled={disabled || fields.length >= 20}
              onClick={() => add({ image: null, url: "", altText: "", sponsorName: "" })}
            >
              添加轮播图
            </Button>
          </Flex>

          {fields.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无轮播图。添加图片后保存；保存空列表可清空轮播图。"
            />
          ) : (
            fields.map((field, index) => (
              <div key={field.key} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                <Flex justify="space-between" align="center" wrap gap={8} className="mb-4">
                  <Typography.Text strong>轮播图 {index + 1}</Typography.Text>
                  <Space size={4}>
                    <Button
                      type="text"
                      icon={<IconArrowUp size={16} stroke={1.5} />}
                      aria-label={`上移第 ${index + 1} 张轮播图`}
                      title="上移"
                      disabled={disabled || index === 0}
                      onClick={() => move(index, index - 1)}
                    />
                    <Button
                      type="text"
                      icon={<IconArrowDown size={16} stroke={1.5} />}
                      aria-label={`下移第 ${index + 1} 张轮播图`}
                      title="下移"
                      disabled={disabled || index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<IconTrash size={16} stroke={1.5} />}
                      aria-label={`删除第 ${index + 1} 张轮播图`}
                      disabled={disabled}
                      onClick={() => remove(field.name)}
                    >
                      删除
                    </Button>
                  </Space>
                </Flex>
                <div className="grid grid-cols-1 gap-x-6 md:grid-cols-[240px_minmax(0,1fr)]">
                  <Form.Item
                    name={[field.name, "image"]}
                    label="轮播图片"
                    required
                    rules={[
                      {
                        validator: (_, image: MediaBinding | null | undefined) =>
                          image?.mediaAssetId
                            ? Promise.resolve()
                            : Promise.reject(new Error("请选择或上传轮播图片")),
                      },
                    ]}
                  >
                    <MediaPicker
                      variant="gallery"
                      disabled={disabled}
                      onBusyChange={onBusyChange}
                    />
                  </Form.Item>
                  <div className="min-w-0">
                    <Form.Item
                      name={[field.name, "sponsorName"]}
                      label="赞助商名称"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          max: 128,
                          transform: (value: string) => value?.trim(),
                          message: "请输入赞助商名称，最多 128 字",
                        },
                      ]}
                    >
                      <Input maxLength={128} placeholder="输入赞助商名称" />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "url"]}
                      label="跳转链接"
                      rules={[
                        { required: true, message: "请输入跳转链接" },
                        {
                          type: "url",
                          pattern: /^https?:\/\//,
                          max: 2048,
                          transform: (value: string) => value?.trim(),
                          message: "请输入完整的 HTTP 或 HTTPS 链接，最多 2048 字符",
                        },
                      ]}
                    >
                      <Input maxLength={2048} placeholder="https://example.com" />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "altText"]}
                      label="替代文本"
                      tooltip="描述图片内容，供屏幕阅读器及图片无法显示时使用。"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          max: 256,
                          transform: (value: string) => value?.trim(),
                          message: "请输入图片替代文本，最多 256 字",
                        },
                      ]}
                    >
                      <Input maxLength={256} placeholder="描述图片展示的内容" />
                    </Form.Item>
                  </div>
                </div>
              </div>
            ))
          )}
          <Form.ErrorList errors={errors} />
        </div>
      )}
    </Form.List>
  );
}
