import { Region } from "@/types/region";
import { UseFormReturn } from "react-hook-form";
import { Typography, Button, Flex, App, Form, Input } from "antd";
import { EditEventSchema } from "@/types/event";
import { InferZodType } from "@/types/common";

const { Title } = Typography;

interface UriBuilderProps {
  form: UseFormReturn<InferZodType<typeof EditEventSchema>>;
  selectedRegion: Region | null;
}

export default function UriBuilder({ form, selectedRegion }: UriBuilderProps) {
  const { message } = App.useApp();

  const generateEventSlug = () => {
    const startAt = form.watch("startAt");
    const selectedYear = new Date(startAt).getFullYear();
    const selectedMonth = new Date(startAt)
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
    <div>
      <h5 className="text-lg font-bold">URI构建</h5>
      <Flex vertical gap={8}>
        <Form.Item
          label="展会Slug"
          required
          validateStatus={form.formState.errors.slug ? "error" : undefined}
          help={form.formState.errors.slug?.message}
        >
          <Input
            disabled
            placeholder="请输入展会Slug"
            {...form.register("slug")}
          />
        </Form.Item>
        <Button
          onClick={() => {
            const slug = generateEventSlug();
            if (!slug) {
              return;
            }
            form.setValue("slug", slug);
          }}
        >
          生成Slug
        </Button>
      </Flex>
    </div>
  );
}
