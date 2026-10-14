import { useRef, useState, type ReactNode } from "react";
import { App, Button, Flex, Image, Progress, Spin, Typography, Upload, theme } from "antd";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import ImgCrop from "antd-img-crop";
import type { MediaBinding, MediaOwner } from "@/types/media";
import { uploadToCOS } from "@/utils/cos";
import { imageUrl } from "@/utils/imageLoader";
import { apiErrorMessage } from "@/utils/apiError";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/bmp"];

export default function UploadImage({
  value,
  onChange,
  onUploadSuccess,
  owner,
  disabled,
  onBusyChange,
  hint,
  crop = false,
  aspect = 1,
  label = "图片",
  previewWidth = 120,
  previewHeight,
  fillHeight = false,
}: {
  value?: MediaBinding | null;
  onChange?: (value: MediaBinding | null) => void;
  onUploadSuccess?: (asset: MediaBinding) => void;
  owner?: MediaOwner;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  hint?: ReactNode;
  /** 是否在上传前裁剪图片。 */
  crop?: boolean;
  /** 裁剪框宽高比，仅在 crop 为 true 时生效。 */
  aspect?: number;
  label?: string;
  previewWidth?: number;
  previewHeight?: number;
  /** 撑满父级 Flex 容器的可用高度。 */
  fillHeight?: boolean;
}) {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const rejectedFiles = useRef(new WeakSet<File>());
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);

  const updateBusy = (next: boolean) => {
    busyRef.current = next;
    setBusy(next);
    onBusyChange?.(next);
  };
  const validate = (file: File) => {
    if (!imageTypes.includes(file.type)) {
      message.error("请选择 JPEG、PNG、WebP、GIF、AVIF 或 BMP 图片");
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      message.error("图片不能超过 50 MB");
      return false;
    }
    return true;
  };

  const upload = (
    <Upload
      accept={imageTypes.join(",")}
      listType={value || fillHeight ? "text" : "picture-card"}
      showUploadList={false}
      styles={
        !value && fillHeight
          ? {
              root: { width: "100%", height: "100%" },
              trigger: { width: "100%", height: "100%" },
            }
          : !value && previewHeight
            ? { trigger: { width: previewWidth, height: previewHeight, margin: 0 } }
            : undefined
      }
      disabled={disabled || busy}
      beforeUpload={async (file) => {
        // beforeCrop 返回 false 时，裁剪库仍会调用 beforeUpload。
        if (rejectedFiles.current.has(file)) return Upload.LIST_IGNORE;
        if (!crop) {
          if (disabled || busyRef.current || !validate(file)) return Upload.LIST_IGNORE;
          updateBusy(true);
        }
        setUploading(true);
        setPercent(0);
        try {
          if (file.size > 50 * 1024 * 1024) throw new Error("图片不能超过 50 MB");
          let uploadFile: File = file;
          if (crop && file.type !== "image/png") {
            // Canvas 不支持原格式时会导出 PNG，但裁剪库仍沿用原文件的 MIME 类型。
            const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
            const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
            if (pngSignature.every((byte, index) => header[index] === byte)) {
              uploadFile = new File([file], file.name, { type: "image/png" });
            }
          }
          const asset = await uploadToCOS({
            file: uploadFile,
            owner,
            onProgress: (progress) => setPercent(Math.round(progress * 100)),
          });
          const binding = { mediaAssetId: asset.mediaAssetId, url: asset.url };
          onChange?.(binding);
          onUploadSuccess?.(binding);
          message.success(`${label}上传成功`);
        } catch (error) {
          message.error(apiErrorMessage(error, `${label}上传失败，请重试`));
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
          aria-label={`编辑${label}`}
          title={`编辑${label}`}
          icon={<IconPencil size={20} />}
          loading={uploading}
          disabled={disabled || busy}
          style={{ color: "white" }}
        />
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          style={
            fillHeight
              ? {
                  width: "100%",
                  height: "100%",
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  background: token.colorFillAlter,
                  color: "inherit",
                  cursor: "inherit",
                }
              : { border: 0, background: "none", color: "inherit", cursor: "inherit" }
          }
        >
          <Flex vertical align="center" gap={8}>
            {uploading ? <Spin size="small" /> : <IconPlus size={24} aria-hidden />}
            <span>{uploading ? "正在上传" : `上传${label}`}</span>
          </Flex>
        </button>
      )}
    </Upload>
  );

  return (
    <Flex
      vertical
      gap={12}
      align="start"
      style={fillHeight ? { flex: 1, minHeight: 0, width: previewWidth } : undefined}
    >
      <div
        style={{
          position: "relative",
          width: previewWidth,
          borderRadius: 8,
          overflow: "hidden",
          height: fillHeight ? undefined : previewHeight,
          flex: fillHeight ? 1 : undefined,
          minHeight: 0,
        }}
      >
        {value && (
          <div style={fillHeight ? { position: "absolute", inset: 0 } : undefined}>
            <Image
              src={value.url ? imageUrl(value.url) : undefined}
              alt={label}
              width={previewWidth}
              height={fillHeight ? "100%" : (previewHeight ?? (crop ? previewWidth / aspect : undefined))}
              preview
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
        <Flex
          gap={8}
          justify={value ? "center" : undefined}
          style={
            value
              ? { position: "absolute", inset: "auto 0 0", padding: 8, background: "rgba(0, 0, 0, 0.45)" }
              : fillHeight
                ? { position: "absolute", inset: 0 }
                : undefined
          }
        >
          {crop ? (
            <ImgCrop
              aspect={aspect}
              quality={0.92}
              fillColor="transparent"
              rotationSlider
              showReset
              modalTitle={`裁剪${label}`}
              modalOk="裁剪并上传"
              modalCancel="取消"
              resetText="重置"
              beforeCrop={(file) => {
                if (disabled || busyRef.current || !validate(file)) {
                  rejectedFiles.current.add(file);
                  return false;
                }
                updateBusy(true);
                return true;
              }}
              onModalCancel={() => updateBusy(false)}
            >
              {upload}
            </ImgCrop>
          ) : (
            upload
          )}
          {value && (
            <Button
              type="text"
              aria-label={`删除${label}`}
              title={`删除${label}`}
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
          <Typography.Text type="secondary">
            {percent === 100 ? "正在确认上传结果…" : `正在上传${label}…`}
          </Typography.Text>
        </div>
      )}
      {hint != null && <Typography.Text type="secondary">{hint}</Typography.Text>}
    </Flex>
  );
}
