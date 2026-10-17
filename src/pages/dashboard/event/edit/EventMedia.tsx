import { useRef, useState } from "react";
import { Button, Card, Flex, Form, Input, Typography } from "antd";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import type { MediaBinding, MediaOwner } from "@/types/media";
import styles from "./EventMedia.module.css";
import UploadImage from "@/components/UploadImage";

const imageHint = "支持 JPEG、PNG、WebP、GIF、AVIF 和 BMP，最大 50 MB。";

export default function EventMedia({
  owner,
  disabled,
  onBusyChange,
}: {
  disabled: boolean;
  owner?: MediaOwner;
  onBusyChange: (busy: boolean) => void;
}) {
  const form = Form.useFormInstance();
  const busyUploads = useRef(new Set<string | number>());
  const [busy, setBusy] = useState(false);
  const updateBusy = (key: string | number, next: boolean) => {
    if (next) busyUploads.current.add(key);
    else busyUploads.current.delete(key);
    const processing = busyUploads.current.size > 0;
    setBusy(processing);
    onBusyChange(processing);
  };

  return (
    <div>
      <Typography.Title level={5}>活动媒体资源</Typography.Title>
      <Form.Item label="封面" name="cover" tooltip={imageHint}>
        <UploadImage
          label="封面"
          previewWidth={240}
          crop={false}
          owner={owner}
          disabled={disabled || !owner}
          onBusyChange={(next) => updateBusy("cover", next)}
        />
      </Form.Item>
      <Form.Item label="详情海报" tooltip={imageHint}>
        <Form.List name="poster">
          {(fields, { add, remove, move }) => (
            <Flex vertical gap={16}>
              {fields.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center">
                  <Typography.Text type="secondary">
                    {owner
                      ? "暂无详情海报，添加后可上传图片并填写说明。"
                      : "创建活动后可以添加详情海报。"}
                  </Typography.Text>
                </div>
              )}
              {fields.map((field, index) => (
                <Card key={field.key} size="small">
                  <Flex justify="space-between" align="center" wrap gap={8} className="mb-4">
                    <Typography.Text>详情海报 {index + 1}</Typography.Text>
                    <Flex gap={4}>
                      <Button
                        type="text"
                        icon={<IconArrowUp size={18} />}
                        aria-label={`上移详情海报 ${index + 1}`}
                        title="上移"
                        disabled={disabled || busy || index === 0}
                        onClick={() => move(index, index - 1)}
                      />
                      <Button
                        type="text"
                        icon={<IconArrowDown size={18} />}
                        aria-label={`下移详情海报 ${index + 1}`}
                        title="下移"
                        disabled={disabled || busy || index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<IconTrash size={18} />}
                        aria-label={`删除详情海报 ${index + 1}`}
                        title="删除此项"
                        disabled={disabled || busy}
                        onClick={() => remove(field.name)}
                      />
                    </Flex>
                  </Flex>
                  <div className={styles.posterRow}>
                    <div className={styles.imageColumn}>
                      <Form.Item
                        className={styles.imageField}
                        name={[field.name, "mediaAssetId"]}
                        rules={[{ required: true, message: "请上传详情海报图片，或删除此项" }]}
                        getValueProps={(mediaAssetId) => ({
                          value: mediaAssetId
                            ? {
                                mediaAssetId,
                                url: form.getFieldValue(["poster", field.name, "url"]),
                              }
                            : null,
                        })}
                        getValueFromEvent={(asset: MediaBinding | null) => {
                          form.setFieldValue(["poster", field.name, "url"], asset?.url);
                          return asset?.mediaAssetId;
                        }}
                      >
                        <UploadImage
                          label="图片"
                          previewWidth={240}
                          fillHeight
                          crop={false}
                          owner={owner}
                          disabled={disabled || !owner}
                          onBusyChange={(next) => updateBusy(field.key, next)}
                        />
                      </Form.Item>
                      <Form.Item name={[field.name, "url"]} hidden>
                        <Input />
                      </Form.Item>
                    </div>
                    <div className="min-w-0">
                      <Form.Item label="标题" name={[field.name, "title"]}>
                        <Input disabled={disabled} placeholder="选填" />
                      </Form.Item>
                      <Form.Item
                        label="描述"
                        name={[field.name, "description"]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input.TextArea
                          disabled={disabled}
                          autoSize={{ minRows: 3, maxRows: 6 }}
                          placeholder="选填"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                type="dashed"
                block
                icon={<IconPlus size={18} />}
                disabled={disabled || busy || !owner}
                onClick={() => add({})}
              >
                添加详情海报
              </Button>
            </Flex>
          )}
        </Form.List>
      </Form.Item>
    </div>
  );
}
