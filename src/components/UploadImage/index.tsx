import { uploadStatic } from "@/api/dashboard/upload";
import {
  Button,
  Card,
  Center,
  Group,
  Modal,
  rem,
  SimpleGrid,
  Stack,
  TextInput,
  Image,
} from "@mantine/core";
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { nanoid } from "nanoid";
import { useState } from "react";

export default function UploadImage({
  pathPrefix,
  defaultImageName,
  onUploadSuccess,
  disabled,
}: {
  pathPrefix: string;
  defaultImageName?: string;
  onUploadSuccess: (imagePath: string) => void;
  disabled?: boolean;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState<FileWithPath[]>([]);
  const [imageName, setImageName] = useState(() => {
    if (defaultImageName) {
      return `${defaultImageName}-${nanoid()}`;
    }
    return nanoid();
  });
  const [imageMIME, setImageMINE] = useState("");

  const previews = images.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Image
        alt={imageUrl}
        key={index}
        src={imageUrl}
        onLoad={() => URL.revokeObjectURL(imageUrl)}
      />
    );
  });

  const onUpload = async () => {
    try {
      setLoading(true);
      if (!images[0]) {
        setLoading(false);
        return notifications.show({
          message: "没有图片",
        });
      }

      let formData = new FormData();
      const imagePath = `${pathPrefix}${imageName}.${imageMIME}`;
      formData.append("imageKey", `${pathPrefix}${imageName}.${imageMIME}`);
      formData.append("image", images[0], images[0].name);
      const uploadRes = await uploadStatic(formData);
      console.log("uploadRes", uploadRes);
      if (uploadRes?.S3UploadRes?.ETag) {
        setLoading(false);
        onUploadSuccess(imagePath);
        notifications.show({
          message: "图片上传成功",
        });
        close();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button disabled={disabled} onClick={open}>
        上传
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title="上传图片"
        centered
        size="xl"
      >
        <Group wrap={"nowrap"} justify="flex-start" align="flex-start" gap="xl">
          <Stack style={{ width: "50%" }}>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              onPaste={(e) => {
                if (e.clipboardData.files.length) {
                  setImages([e.clipboardData.files[0]]);
                  if (e.clipboardData.files[0]) {
                    setImageMINE(
                      e.clipboardData.files[0].type.replace("image/", "")
                    );
                  }
                }
              }}
            >
              <Center>在这里粘贴</Center>
            </Card>
            <Dropzone
              onDrop={(files) => {
                setImages(files);
                if (files[0]) {
                  setImageMINE(files[0].type.replace("image/", ""));
                }
              }}
              onReject={(files) => {
                notifications.show({
                  title: "不受支持的文件",
                  message: JSON.stringify(files[0].errors),
                });
              }}
              maxSize={20 * 1024 ** 2}
              accept={IMAGE_MIME_TYPE}
              multiple={false}
            >
              <Group
                justify="center"
                gap="xl"
                style={{ pointerEvents: "none" }}
              >
                {images.length ? (
                  <SimpleGrid
                    cols={{ base: 1, sm: 1 }}
                    // mt={previews.length > 0 ? "xl" : 0}
                  >
                    {previews}
                  </SimpleGrid>
                ) : (
                  <>
                    <Dropzone.Accept>
                      <IconUpload
                        style={{
                          width: rem(52),
                          height: rem(52),
                          color: "var(--mantine-color-blue-6)",
                        }}
                        stroke={1.5}
                      />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <IconX
                        style={{
                          width: rem(52),
                          height: rem(52),
                          color: "var(--mantine-color-red-6)",
                        }}
                        stroke={1.5}
                      />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconPhoto
                        style={{
                          width: rem(52),
                          height: rem(52),
                          color: "var(--mantine-color-dimmed)",
                        }}
                        stroke={1.5}
                      />
                    </Dropzone.Idle>
                  </>
                )}
              </Group>
            </Dropzone>
          </Stack>
          <Stack style={{ flexShrink: 0, width: "50%" }}>
            <TextInput
              description={`${pathPrefix}${imageName}.${imageMIME}`}
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
            />
            <Button loading={loading} onClick={onUpload}>
              上传
            </Button>
          </Stack>
        </Group>
      </Modal>
    </>
  );
}
