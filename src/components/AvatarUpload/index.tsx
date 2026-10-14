import { useRef, useState } from "react";
import { App, Button, Flex, Image, Progress, Spin, Typography, Upload } from "antd";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import ImgCrop from "antd-img-crop";
import type { MediaBinding, MediaOwner } from "@/types/media";
import { uploadToCOS } from "@/utils/cos";
import { imageUrl } from "@/utils/imageLoader";
import { apiErrorMessage } from "@/utils/apiError";

const imageTypes = ["image/jpeg", "image/png", "image/webp"];

export default function AvatarUpload({
  value,
  onChange,
  owner,
  disabled,
  onBusyChange,
  showHint = true,
}: {
  value?: MediaBinding | null;
  onChange?: (value: MediaBinding | null) => void;
  owner?: MediaOwner;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  showHint?: boolean;
}) {
  const { message } = App.useApp();
  const rejectedFiles = useRef(new WeakSet<File>());
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);

  const updateBusy = (next: boolean) => {
    setBusy(next);
    onBusyChange?.(next);
  };

  return (
    <Flex vertical gap={12} align="start">
      <div
        style={
          value ? { position: "relative", width: 120, height: 120, borderRadius: 8, overflow: "hidden" } : undefined
        }
      >
        {value && (
          <Image
            src={value.url ? imageUrl(value.url) : undefined}
            alt="组织头像"
            width={120}
            height={120}
            preview={false}
            style={{ objectFit: "contain" }}
          />
        )}
        <Flex
          gap={8}
          justify={value ? "center" : undefined}
          style={
            value
              ? { position: "absolute", inset: "auto 0 0", padding: 8, background: "rgba(0, 0, 0, 0.45)" }
              : undefined
          }
        >
          <ImgCrop
            aspect={1}
            quality={0.92}
            fillColor="transparent"
            rotationSlider
            showReset
            modalTitle="裁剪组织头像"
            modalOk="裁剪并上传"
            modalCancel="取消"
            resetText="重置"
            beforeCrop={(file) => {
              if (disabled || busy) {
                rejectedFiles.current.add(file);
                return false;
              }
              if (!imageTypes.includes(file.type)) {
                rejectedFiles.current.add(file);
                message.error("请选择 JPEG、PNG 或 WebP 图片");
                return false;
              }
              if (file.size > 50 * 1024 * 1024) {
                rejectedFiles.current.add(file);
                message.error("图片不能超过 50 MB");
                return false;
              }
              updateBusy(true);
              return true;
            }}
            onModalCancel={() => updateBusy(false)}
          >
            <Upload
              accept={imageTypes.join(",")}
              listType={value ? "text" : "picture-card"}
              showUploadList={false}
              disabled={disabled || busy}
              beforeUpload={async (file) => {
                // beforeCrop 返回 false 时，裁剪库仍会调用 beforeUpload。
                if (rejectedFiles.current.has(file)) return Upload.LIST_IGNORE;
                setUploading(true);
                setPercent(0);
                try {
                  if (file.size > 50 * 1024 * 1024) throw new Error("裁剪后的图片不能超过 50 MB");
                  const extension = file.type.split("/")[1];
                  const asset = await uploadToCOS({
                    pathKey: `avatar.${extension}`,
                    file,
                    owner,
                    onProgress: (progress) => setPercent(Math.round(progress * 100)),
                  });
                  onChange?.({ mediaAssetId: asset.mediaAssetId, url: asset.url });
                  message.success("头像上传成功");
                } catch (error) {
                  message.error(apiErrorMessage(error, "头像上传失败，请重试"));
                } finally {
                  setUploading(false);
                  updateBusy(false);
                }
                return false;
              }}
            >
              {value ? (
                <Button
                  type="text"
                  aria-label="编辑头像"
                  title="编辑头像"
                  icon={<IconPencil size={20} />}
                  loading={uploading}
                  disabled={disabled || busy}
                  style={{ color: "white" }}
                />
              ) : (
                <button
                  type="button"
                  disabled={disabled || busy}
                  style={{ border: 0, background: "none", color: "inherit", cursor: "inherit" }}
                >
                  <Flex vertical align="center" gap={8}>
                    {uploading ? <Spin size="small" /> : <IconPlus size={24} aria-hidden />}
                    <span>{uploading ? "正在上传" : "上传头像"}</span>
                  </Flex>
                </button>
              )}
            </Upload>
          </ImgCrop>
          {value && (
            <Button
              type="text"
              aria-label="删除头像"
              title="删除头像"
              icon={<IconTrash size={20} />}
              disabled={disabled || busy}
              onClick={() => onChange?.(null)}
              style={{ color: "white" }}
            />
          )}
        </Flex>
      </div>
      {uploading && (
        <div style={{ width: 240 }}>
          <Progress percent={percent} status="active" />
          <Typography.Text type="secondary">{percent === 100 ? "正在确认上传结果…" : "正在上传头像…"}</Typography.Text>
        </div>
      )}
      {showHint && <Typography.Text type="secondary">支持 JPEG、PNG 和 WebP，最大 50 MB。</Typography.Text>}
    </Flex>
  );
}
