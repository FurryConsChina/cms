import { useEffect, useId, useState } from "react";
import useSWR from "swr";
import {
  Alert,
  App,
  Button,
  Card,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Pagination,
  Space,
  Typography,
} from "antd";
import type { MediaAsset, MediaBinding } from "@/types/media";
import type { List } from "@/types/request";
import { createExternalMedia, isImageAsset, listMediaAssets } from "@/api/cms/upload";
import UploadImage from "@/components/media/UploadImage";
import useMediaBusy from "./useMediaBusy";
import { apiErrorMessage } from "@/utils/apiError";
import { imageUrl } from "@/utils/imageLoader";
import { IconPhoto, IconTrash, IconUser } from "@tabler/icons-react";

export default function MediaPicker({
  value,
  onChange,
  onBusyChange,
  disabled,
  variant = "default",
}: {
  value?: MediaBinding | null;
  onChange?: (value: MediaBinding | null) => void;
  onBusyChange?: (key: string, busy: boolean) => void;
  disabled?: boolean;
  variant?: "default" | "gallery" | "avatar";
}) {
  const { message } = App.useApp();
  const [opened, setOpened] = useState(false);
  const [current, setCurrent] = useState(1);
  const [url, setUrl] = useState("");
  const { busy, onBusyChange: updateBusy } = useMediaBusy();
  const busyId = useId();
  useEffect(() => {
    onBusyChange?.(busyId, busy);
    return () => onBusyChange?.(busyId, false);
  }, [busy, busyId, onBusyChange]);
  const { data, error, mutate } = useSWR<List<MediaAsset>, Error>(
    opened ? ["media-picker", current] : null,
    () => listMediaAssets({ current, pageSize: 12 }),
  );
  const select = (asset: MediaBinding) => {
    onChange?.({ ...value, ...asset });
    setOpened(false);
  };
  const selectButton = (
    <Button
      type={variant === "gallery" ? "text" : "default"}
      className={variant === "gallery" ? "h-9 w-full rounded-none border-0 shadow-none" : undefined}
      icon={variant === "default" ? undefined : <IconPhoto size={16} stroke={1.5} />}
      disabled={disabled || busy}
      onClick={() => setOpened(true)}
    >
      {variant === "avatar" ? "从媒体库选择" : variant === "gallery" ? "媒体库" : "选择媒体"}
    </Button>
  );
  const uploadButton = (
    <UploadImage
      trigger={variant === "avatar" ? "button" : variant === "gallery" ? "toolbar" : "dropzone"}
      crop={variant === "avatar"}
      aspect={1}
      label={variant === "avatar" ? "头像" : "图片"}
      onBusyChange={(next) => updateBusy("upload", next)}
      disabled={disabled || busy}
      onUploadSuccess={(asset) => {
        select(asset);
        void mutate();
      }}
    />
  );
  const removeButton = value ? (
    <Button
      type={variant === "avatar" ? "text" : "default"}
      danger={variant === "avatar"}
      icon={variant === "avatar" ? <IconTrash size={16} stroke={1.5} /> : undefined}
      disabled={disabled || busy}
      onClick={() => onChange?.(null)}
    >
      移除
    </Button>
  ) : null;

  return (
    <div className={variant === "avatar" ? undefined : "space-y-2"}>
      {variant === "avatar" ? (
        <Flex align="center" wrap gap={16} className="rounded-xl bg-slate-100/60 p-4">
          <div className="size-24 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
            {value?.url ? (
              <Image
                src={imageUrl(value.url)}
                alt={value.altText ?? value.title ?? "主体头像"}
                width={96}
                height={96}
                style={{ objectFit: "cover", display: "block" }}
              />
            ) : (
              <Flex align="center" justify="center" className="h-full text-slate-400">
                <IconUser size={36} stroke={1.25} />
              </Flex>
            )}
          </div>
          <div className="min-w-56 flex-1 space-y-3">
            <Typography.Text type="secondary" className="block">
              用于列表和资料页展示，建议使用正方形图片。
            </Typography.Text>
            <Space wrap>
              {selectButton}
              {uploadButton}
              {removeButton}
            </Space>
          </div>
        </Flex>
      ) : (
        <>
          {variant === "gallery" ? (
            <div>
              <div className="overflow-hidden rounded-lg">
                {value?.url ? (
                  <Image
                    src={imageUrl(value.url)}
                    alt={value.altText ?? value.title ?? "相册图片"}
                    width="100%"
                    height={140}
                    style={{ objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <Flex vertical align="center" justify="center" gap={6} className="h-[140px]">
                    <IconPhoto size={24} stroke={1.25} className="text-slate-400" />
                    <Typography.Text type="secondary">
                      {value?.mediaAssetId ? "已选择媒体资源" : "尚未选择图片"}
                    </Typography.Text>
                  </Flex>
                )}
              </div>
              <div className="mt-1 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {selectButton}
                {uploadButton}
              </div>
            </div>
          ) : value?.url ? (
            <Image
              src={imageUrl(value.url)}
              width={120}
              height={100}
              style={{ objectFit: "contain" }}
            />
          ) : value?.mediaAssetId ? (
            <Typography.Text>已选择媒体资源</Typography.Text>
          ) : null}
          {variant !== "gallery" && (
            <Space wrap>
              {selectButton}
              {uploadButton}
              {variant === "default" && removeButton}
            </Space>
          )}
        </>
      )}
      <Modal
        title="选择媒体资源"
        open={opened}
        onCancel={() => !busy && setOpened(false)}
        footer={null}
        width={850}
      >
        <Flex gap={8} className="mb-4">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="外部图片、视频或直播链接"
          />
          <Button
            loading={busy}
            disabled={disabled || busy}
            onClick={() =>
              void (async () => {
                try {
                  const parsed = new URL(url);
                  if (!["https:", "http:"].includes(parsed.protocol))
                    throw new Error("请使用 HTTP 或 HTTPS 链接");
                  updateBusy("external", true);
                  const asset = await createExternalMedia(parsed.toString());
                  select({ mediaAssetId: asset.id, url: asset.url });
                } catch (e) {
                  message.error(apiErrorMessage(e, "请输入有效链接"));
                } finally {
                  updateBusy("external", false);
                }
              })()
            }
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
                <Image
                  src={imageUrl(asset.url)}
                  width={150}
                  height={100}
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <Typography.Paragraph ellipsis={{ rows: 3 }}>{asset.url}</Typography.Paragraph>
              )}
              <Button
                block
                disabled={disabled || busy || asset.status !== "ready"}
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
        <div className="space-y-3 my-4">
          <Flex justify="space-between" align="center">
            <Space orientation="vertical" size={0}>
              <Typography.Text>{label}</Typography.Text>
            </Space>
            <Button disabled={disabled} onClick={() => add({})}>
              添加{label}
            </Button>
          </Flex>
          {fields.map((field, index) => (
            <Card key={field.key} size="small">
              <Form.Item
                name={field.name}
                rules={[
                  {
                    validator: (_, v: MediaBinding | undefined) =>
                      v?.mediaAssetId ? Promise.resolve() : Promise.reject(new Error("请选择媒体")),
                  },
                ]}
              >
                <MediaPicker onBusyChange={onBusyChange} disabled={disabled} />
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
                <Button disabled={disabled || !index} onClick={() => move(index, index - 1)}>
                  上移
                </Button>
                <Button
                  disabled={disabled || index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  下移
                </Button>
                <Button danger disabled={disabled} onClick={() => remove(field.name)}>
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
