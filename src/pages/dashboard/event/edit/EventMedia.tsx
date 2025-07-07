import { Organization } from "@/types/organization";
import { EventItem } from "@/types/event";
import { ActionIcon, Chip, Container, Fieldset, Group, Stack, TextInput, Textarea, Title } from "@mantine/core";
import { Image } from "antd";
import { UseFormReturnType } from "@mantine/form";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import UploadImage from "@/components/UploadImage";

interface EventMediaProps {
  form: UseFormReturnType<any>;
  event?: EventItem;
  selectedOrganization: Organization | null;
}

export default function EventMedia({ form, event, selectedOrganization }: EventMediaProps) {
  return (
    <Container my="md" fluid>
      <Title order={5}>展会媒体资源</Title>

      <Stack justify="flex-start" gap="xs">
        <TextInput
          label="封面图片"
          withAsterisk
          {...form.getInputProps("thumbnail")}
        />
        <Group>
          <Chip
            checked={false}
            variant="filled"
            onClick={() =>
              form.setFieldValue("thumbnail", "fec-event-default-cover.png")
            }
          >
            默认图片
          </Chip>
          <Chip
            checked={false}
            variant="filled"
            onClick={() =>
              form.setFieldValue("thumbnail", "fec-event-blank-cover.png")
            }
          >
            待揭晓图片
          </Chip>

          <Chip
            checked={false}
            variant="filled"
            onClick={() =>
              form.setFieldValue("thumbnail", "fec-event-cancel-cover.png")
            }
          >
            取消图片
          </Chip>

          <UploadImage
            pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
            defaultImageName="cover"
            onUploadSuccess={(s) => form.setFieldValue("thumbnail", s)}
            disabled={!selectedOrganization?.slug || !form.values.slug}
          />
        </Group>

        <Group>
          <Fieldset w="100%" legend="展会详情图片">
            <ActionIcon
              size={"sm"}
              onClick={() =>
                form.setFieldValue(
                  "media.images",
                  form.values.media.images.concat({
                    url: "",
                    title: "",
                    description: "",
                  })
                )
              }
            >
              <IconPlus />
            </ActionIcon>
            {form.values.media.images.map((item: any, index: number) => (
              <div key={item.url} style={{ marginBottom: "1rem" }}>
                <Group>
                  {selectedOrganization?.slug &&
                    form.values.slug &&
                    item.url && (
                      <Image
                        width={140}
                        height={340}
                        src={`https://images.furrycons.cn/${item.url}`}
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  <Stack flex={1}>
                    <TextInput
                      style={{ flexGrow: 1 }}
                      label={`图片地址 ${index + 1}`}
                      placeholder="请输入图片地址"
                      {...form.getInputProps(`media.images.${index}.url`)}
                    />
                    <TextInput
                      style={{ flexGrow: 1 }}
                      label={`图片标题 ${index + 1}`}
                      placeholder="请输入图片标题（可选）"
                      {...form.getInputProps(`media.images.${index}.title`)}
                    />
                    <Textarea
                      style={{ flexGrow: 1 }}
                      label={`图片描述 ${index + 1}`}
                      placeholder="请输入图片描述（可选）"
                      autosize
                      minRows={2}
                      maxRows={4}
                      {...form.getInputProps(
                        `media.images.${index}.description`
                      )}
                    />
                    <UploadImage
                      pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
                      defaultImageName={`details-${index + 1}`}
                      onUploadSuccess={(s) =>
                        form.setFieldValue(`media.images.${index}.url`, s)
                      }
                      disabled={
                        !selectedOrganization?.slug || !form.values.slug
                      }
                    />
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon
                        size="lg"
                        variant="subtle"
                        onClick={() => {
                          if (index > 0) {
                            const items = [
                              ...(form.values.media.images || []),
                            ];
                            [items[index], items[index - 1]] = [
                              items[index - 1],
                              items[index],
                            ];
                            form.setFieldValue("media.images", items);
                          }
                        }}
                        disabled={index === 0}
                      >
                        <IconArrowUp size="14" />
                      </ActionIcon>
                      <ActionIcon
                        size="lg"
                        variant="subtle"
                        onClick={() => {
                          const items = [
                            ...(form.values.media.images || []),
                          ];
                          if (index < items.length - 1) {
                            [items[index], items[index + 1]] = [
                              items[index + 1],
                              items[index],
                            ];
                            form.setFieldValue("media.images", items);
                          }
                        }}
                        disabled={
                          index ===
                          (form.values.media.images || []).length - 1
                        }
                      >
                        <IconArrowDown size="14" />
                      </ActionIcon>
                      <ActionIcon
                        size="lg"
                        color="red"
                        onClick={() =>
                          form.setFieldValue(
                            "media.images",
                            (form.values.media.images || []).filter(
                              (_: any, i: number) => i !== index
                            )
                          )
                        }
                      >
                        <IconTrash size="14" />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Group>
              </div>
            ))}
          </Fieldset>
        </Group>
      </Stack>
    </Container>
  );
} 