import { Region } from "@/types/region";
import { TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { Typography, Button, Flex, App } from "antd";

const { Title } = Typography;

interface UriBuilderProps {
  form: UseFormReturnType<any>;
  selectedRegion: Region | null;
}

export default function UriBuilder({ form, selectedRegion }: UriBuilderProps) {
  const { message } = App.useApp();

  const generateEventSlug = () => {
    const selectedYear = new Date(form.values.startAt).getFullYear();
    const selectedMonth = new Date(form.values.startAt)
      .toLocaleString("en-us", { month: "short" })
      .toLocaleLowerCase();
    const city = selectedRegion?.code;

    if (!selectedYear || !selectedMonth || !city) {
      message.warning("活动日期或活动地区没有选择");
      return;
    }

    return `${selectedYear}-${selectedMonth}-${city.toLowerCase()}-con`;
  };

  return (
    <div style={{ padding: "0 24px" }}>
      <Title level={5}>URI构建</Title>
      <Flex vertical gap={8}>
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
      </Flex>
    </div>
  );
} 