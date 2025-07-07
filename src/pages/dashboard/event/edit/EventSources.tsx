import { ActionIcon, Container, Fieldset, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";

interface EventSourcesProps {
  form: UseFormReturnType<any>;
}

export default function EventSources({ form }: EventSourcesProps) {
  return (
    <Container my="md" fluid>
      <Title order={5}>展会信息来源</Title>
      <Stack>
        <Group>
          <ActionIcon
            size="sm"
            onClick={() =>
              form.setFieldValue("sources", [
                ...(form.values.sources || []),
                { name: "", url: "", description: "" },
              ])
            }
          >
            <IconPlus />
          </ActionIcon>
          <Text size="sm" c="dimmed">
            添加信息来源
          </Text>
        </Group>

        {(form.values.sources || []).map((source: any, index: number) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <Fieldset legend={`信息来源 ${index + 1}`}>
              <Group align="flex-end">
                <TextInput
                  style={{ flexGrow: 1 }}
                  label="名称"
                  placeholder="信息来源名称"
                  {...form.getInputProps(`sources.${index}.name`)}
                />
                <TextInput
                  style={{ flexGrow: 1 }}
                  label="链接"
                  placeholder="信息来源链接"
                  {...form.getInputProps(`sources.${index}.url`)}
                />
                <TextInput
                  style={{ flexGrow: 1 }}
                  label="描述"
                  placeholder="信息来源描述（可选）"
                  {...form.getInputProps(`sources.${index}.description`)}
                />
                <Group gap="xs">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => {
                      if (index > 0) {
                        const items = [...(form.values.sources || [])];
                        [items[index], items[index - 1]] = [
                          items[index - 1],
                          items[index],
                        ];
                        form.setFieldValue("sources", items);
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
                      const items = [...(form.values.sources || [])];
                      if (index < items.length - 1) {
                        [items[index], items[index + 1]] = [
                          items[index + 1],
                          items[index],
                        ];
                        form.setFieldValue("sources", items);
                      }
                    }}
                    disabled={
                      index === (form.values.sources || []).length - 1
                    }
                  >
                    <IconArrowDown size="14" />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    color="red"
                    onClick={() =>
                      form.setFieldValue(
                        "sources",
                        (form.values.sources || []).filter(
                          (_: any, i: number) => i !== index
                        )
                      )
                    }
                  >
                    <IconTrash size="14" />
                  </ActionIcon>
                </Group>
              </Group>
            </Fieldset>
          </div>
        ))}
      </Stack>
    </Container>
  );
} 