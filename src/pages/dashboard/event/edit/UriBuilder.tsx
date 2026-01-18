import { Region } from "@/types/region";
import { Typography, Button, Flex, App, Form, Input } from "antd";
import type { FormInstance } from "antd";
import dayjs from "dayjs";

const { Title } = Typography;

interface UriBuilderProps {
  form: FormInstance;
  selectedRegion?: Region;
}

export default function UriBuilder({ form, selectedRegion }: UriBuilderProps) {
  const { message } = App.useApp();

  const startAtFormValue: dayjs.Dayjs | undefined = Form.useWatch("startAt", form);

  const generateEventSlug = () => {
    const startAtValue =
      startAtFormValue instanceof dayjs ? startAtFormValue.toDate() : dayjs(startAtFormValue).toDate();
    const selectedYear = startAtValue.getFullYear();
    const selectedMonth = startAtValue.toLocaleString("en-us", { month: "short" }).toLocaleLowerCase();
    const city = selectedRegion?.code;

    if (!selectedYear || !selectedMonth || !city) {
      message.warning("活动日期或活动地区没有选择");
      return;
    }

    message.success("Slug生成成功");
    return `${selectedYear}-${selectedMonth}-${city.toLowerCase()}-con`;
  };

  return (
    <div>
      <Title level={5} style={{ margin: "12px 0" }}>
        URI构建
      </Title>
      <Flex vertical>
        <Form.Item label="展会Slug" required name="slug" rules={[{ required: true, message: "请输入展会Slug" }]}>
          <Input disabled placeholder="请输入展会Slug" />
        </Form.Item>
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
