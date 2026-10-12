import type { MediaOwner, MediaBinding } from "@/types/media";
import { uploadToCOS } from "@/utils/cos";
import { Button, Card, Modal, Flex, Input, Image, Typography, Alert, Upload, App } from "antd";
import { IconPhoto } from "@tabler/icons-react";
import { nanoid } from "nanoid";
import { useState } from "react";

const { Text } = Typography;
const { Dragger } = Upload;

export default function UploadImage({
  pathPrefix,
  defaultImageName,
  onUploadSuccess,
  disabled,
  owner,
}: {
  pathPrefix: string;
  defaultImageName?: string;
  onUploadSuccess: (asset: MediaBinding) => void;
  owner?: MediaOwner;
  disabled?: boolean;
}) {
  const { message } = App.useApp();
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [imageName, setImageName] = useState(() => {
    if (defaultImageName) {
      return `${defaultImageName}-${nanoid()}`;
    }
    return nanoid();
  });
  const [imageMIME, setImageMINE] = useState("");

  const previews = images.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return <Image alt={imageUrl} key={index} src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} />;
  });

  const reset = () => {
    setImages([]);
    setImageName(() => {
      if (defaultImageName) {
        return `${defaultImageName}-${nanoid()}`;
      }
      return nanoid();
    });
    setImageMINE("");
  };

  const onClose = () => {
    reset();
    setOpened(false);
  };

  const onUpload = async () => {
    try {
      setLoading(true);
      if (!images[0]) {
        setLoading(false);
        message.warning("没有图片");
        return;
      }

      if (!owner) throw new Error("请先保存后再上传图片");
      const imagePath = `${pathPrefix}${imageName}.${imageMIME}`;

      const uploadRes = await uploadToCOS({
        pathKey: imagePath,
        file: images[0],
        owner,
      });
      if (uploadRes?.ETag) {
        setLoading(false);
        onUploadSuccess({ mediaAssetId: uploadRes.mediaAssetId, url: uploadRes.url });
        message.success("图片上传成功");
        onClose();
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "图片上传失败");
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeUpload = (file: File) => {
    if (!["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/bmp"].includes(file.type)) {
      message.error("请选择 JPEG、PNG、GIF、WebP、AVIF 或 BMP 图片");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 50 * 1024 * 1024) {
      message.error("图片不能超过 50 MB");
      return Upload.LIST_IGNORE;
    }
    setImages([file]);
    setImageMINE(file.type.replace("image/", ""));
    return false; // 阻止自动上传
  };

  return (
    <>
      <Button disabled={disabled || !owner} onClick={() => setOpened(true)}>
        上传
      </Button>
      <Modal open={opened} onCancel={onClose} title="上传图片" centered width={800} footer={null}>
        <Flex gap={24} align="flex-start">
          <Flex vertical style={{ width: "50%" }} gap={16}>
            <Card
              onPaste={(e) => {
                if (e.clipboardData.files.length) {
                  const file = e.clipboardData.files[0];
                  if (file) {
                    handleBeforeUpload(file);
                  }
                }
              }}
            >
              <Flex justify="center">可以在这里粘贴</Flex>
            </Card>
            <Dragger
              accept="image/*"
              maxCount={1}
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              className="cursor-pointer"
            >
              <Flex justify="center" align="center" gap={24} style={{ pointerEvents: "none", padding: 16 }}>
                {images.length ? (
                  <div>{previews}</div>
                ) : (
                  <IconPhoto
                    style={{
                      width: 52,
                      height: 52,
                      color: "#8c8c8c",
                    }}
                    stroke={1.5}
                  />
                )}
              </Flex>
            </Dragger>
          </Flex>
          <Flex vertical style={{ flexShrink: 0, width: "50%" }} gap={16}>
            {images[0] && (
              <Alert
                type="info"
                message="图片信息"
                description={
                  <>
                    图片大小: {images[0]?.size ? `${(images[0].size / (1024 * 1024)).toFixed(2)}MB` : "0MB"}, 图片后缀:{" "}
                    {imageMIME}
                  </>
                }
              />
            )}
            <div>
              <Text type="secondary">{`${pathPrefix}${imageName}.${imageMIME}`}</Text>
              <Input value={imageName} onChange={(e) => setImageName(e.target.value)} style={{ marginTop: 4 }} />
            </div>
            <Button type="primary" loading={loading} onClick={onUpload}>
              上传
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </>
  );
}
