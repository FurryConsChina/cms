import { Region } from "@/types/region";
import { Button, Container, Stack, TextInput, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { notifications } from "@mantine/notifications";

interface UriBuilderProps {
  form: UseFormReturnType<any>;
  selectedRegion: Region | null;
}

export default function UriBuilder({ form, selectedRegion }: UriBuilderProps) {
  const generateEventSlug = () => {
    const selectedYear = new Date(form.values.startAt).getFullYear();
    const selectedMonth = new Date(form.values.startAt)
      .toLocaleString("en-us", { month: "short" })
      .toLocaleLowerCase();
    const city = selectedRegion?.code;

    if (!selectedYear || !selectedMonth || !city) {
      notifications.show({
        message: "活动日期或活动地区没有选择",
        color: "red",
      });
      return;
    }

    return `${selectedYear}-${selectedMonth}-${city.toLowerCase()}-con`;
  };

  return (
    <Container fluid>
      <Title order={5}>URI构建</Title>
      <Stack>
        <TextInput
          withAsterisk
          label="展会Slug"
          disabled
          {...form.getInputProps("slug")}
        />
        <Button
          onClick={() => {
            const slug = generateEventSlug();
            if (!slug) {
              return;
            }
            form.setFieldValue("slug", slug);
          }}
        >
          生成Slug
        </Button>
      </Stack>
    </Container>
  );
} 