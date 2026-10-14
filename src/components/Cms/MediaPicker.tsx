import { useState } from "react";
import useSWR from "swr";
import { Alert, App, Button, Card, Flex, Form, Image, Input, Modal, Pagination, Space, Typography } from "antd";
import type { MediaBinding, MediaOwner } from "@/types/media";
import { createExternalMedia, isImageAsset, listMediaAssets } from "@/api/dashboard/upload";
import UploadImage from "@/components/UploadImage";
import { apiErrorMessage } from "@/utils/apiError";
import { imageUrl } from "@/utils/imageLoader";

export default function MediaPicker({
  value,
  onChange,
  owner,
  disabled,
}: {
  value?: MediaBinding | null;
  onChange?: (value: MediaBinding | null) => void;
  owner?: MediaOwner;
  disabled?: boolean;
}) {
  const { message } = App.useApp();
  const [opened, setOpened] = useState(false);
  const [current, setCurrent] = useState(1);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, error, mutate } = useSWR(opened ? ["media-picker", current] : null, () =>
    listMediaAssets({ current, pageSize: 12 }),
  );
  const select = (asset: MediaBinding) => {
    onChange?.({ ...value, ...asset });
    setOpened(false);
  };
  return (
    <div className="space-y-2">
      {value?.url ? (
        <Image src={imageUrl(value.url)} width={120} height={100} style={{ objectFit: "contain" }} />
      ) : value?.mediaAssetId ? (
        <Typography.Text>已选择媒体资源</Typography.Text>
      ) : null}
      <Space wrap>
        <Button disabled={disabled} onClick={() => setOpened(true)}>
          选择媒体
        </Button>
        <UploadImage
          owner={owner}
          disabled={disabled}
          onUploadSuccess={(asset) => {
            select(asset);
            void mutate();
          }}
        />
        {value && (
          <Button disabled={disabled} onClick={() => onChange?.(null)}>
            移除
          </Button>
        )}
      </Space>
      <Modal title="选择媒体资源" open={opened} onCancel={() => setOpened(false)} footer={null} width={850}>
        <Flex gap={8} className="mb-4">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="外部图片、视频或直播链接" />
          <Button
            loading={busy}
            onClick={async () => {
              try {
                const parsed = new URL(url);
                if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("请使用 HTTP 或 HTTPS 链接");
                setBusy(true);
                const asset = await createExternalMedia(parsed.toString());
                select({ mediaAssetId: asset.id, url: asset.url });
              } catch (e) {
                message.error(apiErrorMessage(e, "请输入有效链接"));
              } finally {
                setBusy(false);
              }
            }}
          >
            添加并选择
          </Button>
        </Flex>
        {error && (
          <Alert
            type="error"
            title={apiErrorMessage(error)}
            action={<Button onClick={() => void mutate()}>重试</Button>}
          />
        )}
        <Flex wrap gap={12}>
          {(data?.records ?? []).map((asset) => (
            <Card key={asset.id} size="small" style={{ width: 180 }}>
              {isImageAsset(asset) ? (
                <Image src={imageUrl(asset.url)} width={150} height={100} style={{ objectFit: "contain" }} />
              ) : (
                <Typography.Paragraph ellipsis={{ rows: 3 }}>{asset.url}</Typography.Paragraph>
              )}
              <Button
                block
                disabled={asset.status !== "ready"}
                onClick={() => select({ mediaAssetId: asset.id, url: asset.url })}
              >
                {asset.status === "ready" ? "选择" : "尚未可用"}
              </Button>
            </Card>
          ))}
        </Flex>
        <Pagination
          current={current}
          pageSize={12}
          total={data?.total}
          onChange={setCurrent}
          showSizeChanger={false}
          className="mt-4"
        />
      </Modal>
    </div>
  );
}

export function MediaListFields({
  name,
  label,
  owner,
  disabled,
}: {
  name: string;
  label: string;
  owner?: MediaOwner;
  disabled?: boolean;
}) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove, move }) => (
        <div className="space-y-3 my-4">
          <Flex justify="space-between" align="center">
            <Space orientation="vertical" size={0}>
              <Typography.Text>{label}</Typography.Text>
              {!owner && <Typography.Text type="secondary">创建后可以添加{label}。</Typography.Text>}
            </Space>
            <Button disabled={disabled || !owner} onClick={() => add({})}>
              添加{label}
            </Button>
          </Flex>
          {fields.map((field, index) => (
            <Card key={field.key} size="small">
              <Form.Item
                name={field.name}
                rules={[
                  {
                    validator: (_, v) =>
                      v?.mediaAssetId ? Promise.resolve() : Promise.reject(new Error("请选择媒体")),
                  },
                ]}
              >
                <MediaPicker owner={owner} disabled={disabled} />
              </Form.Item>
              <Form.Item label="标题" name={[field.name, "title"]}>
                <Input />
              </Form.Item>
              <Form.Item label="描述" name={[field.name, "description"]}>
                <Input.TextArea />
              </Form.Item>
              <Form.Item label="替代文本" name={[field.name, "altText"]}>
                <Input />
              </Form.Item>
              <Space>
                <Button disabled={!index} onClick={() => move(index, index - 1)}>
                  上移
                </Button>
                <Button disabled={index === fields.length - 1} onClick={() => move(index, index + 1)}>
                  下移
                </Button>
                <Button danger onClick={() => remove(field.name)}>
                  移除
                </Button>
              </Space>
            </Card>
          ))}
        </div>
      )}
    </Form.List>
  );
}
