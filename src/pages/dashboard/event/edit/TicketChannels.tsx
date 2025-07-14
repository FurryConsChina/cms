import { ActionIcon, Container, Fieldset, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";

interface TicketChannelsProps {
  form: UseFormReturnType<any>;
}

export default function TicketChannels({ form }: TicketChannelsProps) {
  return (
    <Container my="md" fluid>
      <Title order={5}>票务渠道</Title>
      <Stack>
        <Group>
          <ActionIcon
            size="sm"
            onClick={() =>
              form.setFieldValue("ticketChannels", [
                ...(form.values.ticketChannels || []),
                {
                  type: "url",
                  name: "",
                  url: "",
                  available: true,
                },
              ])
            }
          >
            <IconPlus />
          </ActionIcon>
          <Text size="sm" c="dimmed">
            添加票务渠道
          </Text>
        </Group>

        {(form.values.ticketChannels || []).map((channel: any, index: number) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <Fieldset legend={`票务渠道 ${index + 1}`}>
              <Stack gap="xs">
                <Group align="flex-end">
                  <Select
                    style={{ flexGrow: 1 }}
                    label="渠道类型"
                    placeholder="选择渠道类型"
                    data={[
                      { label: "微信小程序", value: "wxMiniProgram" },
                      { label: "网页链接", value: "url" },
                      { label: "二维码", value: "qrcode" },
                      { label: "APP", value: "app" },
                    ]}
                    {...form.getInputProps(`ticketChannels.${index}.type`)}
                  />
                  <TextInput
                    style={{ flexGrow: 1 }}
                    label="渠道名称"
                    placeholder="票务渠道名称"
                    {...form.getInputProps(`ticketChannels.${index}.name`)}
                  />
                  <TextInput
                    style={{ flexGrow: 1 }}
                    label="渠道链接/地址/描述"
                    placeholder="渠道链接或地址或描述"
                    {...form.getInputProps(`ticketChannels.${index}.url`)}
                  />
                  <Select
                    style={{ flexGrow: 1 }}
                    label="可用状态"
                    placeholder="选择状态"
                    data={[
                      { label: "可用", value: "true" },
                      { label: "不可用", value: "false" },
                    ]}
                    value={
                      form.values.ticketChannels?.[
                        index
                      ]?.available?.toString() || "true"
                    }
                    onChange={(value) => {
                      const boolValue =
                        value === "true"
                          ? true
                          : value === "false"
                          ? false
                          : null;
                      form.setFieldValue(
                        `ticketChannels.${index}.available`,
                        boolValue
                      );
                    }}
                  />
                </Group>
                <Group justify="flex-end">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => {
                      if (index > 0) {
                        const items = [
                          ...(form.values.ticketChannels || []),
                        ];
                        [items[index], items[index - 1]] = [
                          items[index - 1],
                          items[index],
                        ];
                        form.setFieldValue("ticketChannels", items);
                      }
                    }}
                    disabled={index === 0}
                  >
                    <IconArrowUp size="14" />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => {
                      const items = [...(form.values.ticketChannels || [])];
                      if (index < items.length - 1) {
                        [items[index], items[index + 1]] = [
                          items[index + 1],
                          items[index],
                        ];
                        form.setFieldValue("ticketChannels", items);
                      }
                    }}
                    disabled={
                      index ===
                      (form.values.ticketChannels || []).length - 1
                    }
                  >
                    <IconArrowDown size="14" />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    color="red"
                    onClick={() =>
                      form.setFieldValue(
                        "ticketChannels",
                        (form.values.ticketChannels || []).filter(
                          (_: any, i: number) => i !== index
                        )
                      )
                    }
                  >
                    <IconTrash size="14" />
                  </ActionIcon>
                </Group>
              </Stack>
            </Fieldset>
          </div>
        ))}
      </Stack>
    </Container>
  );
} 