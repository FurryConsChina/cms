import { useState } from "react";
import { App, Button, Card, Form, Input, Statistic, Typography } from "antd";
import { cleanPageCache, getPageview } from "@/api/cms/cache";
import { apiErrorMessage } from "@/utils/apiError";
import DefaultContainer from "@/components/layout/Container";

export default function InfrastructurePage() {
  const { message } = App.useApp();
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState<number>();
  return (
    <div className="space-y-4">
      <DefaultContainer className="sticky top-0 z-20">
        <Typography.Title level={3} className="m-0">
          页面缓存与浏览量
        </Typography.Title>
      </DefaultContainer>
      <Card title="刷新页面缓存">
        <Form
          layout="vertical"
          onFinish={async ({ path }: { path: string }) => {
            setBusy(true);
            try {
              await cleanPageCache(path);
              message.success("缓存刷新完成");
            } catch (e) {
              message.error(apiErrorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Form.Item
            label="页面路径"
            name="path"
            rules={[
              { required: true },
              { pattern: /^\/(?!\/)/, message: "请输入站内路径，例如 /event/example-abc1234" },
            ]}
          >
            <Input placeholder="/" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={busy}>
            刷新缓存
          </Button>
        </Form>
      </Card>
      <Card title="页面浏览量">
        <Form
          layout="inline"
          onFinish={async ({ path }: { path: string }) => {
            setCount(undefined);
            try {
              const result = await getPageview(path);
              setCount(result.pageCount);
            } catch (e) {
              message.error(apiErrorMessage(e));
            }
          }}
        >
          <Form.Item name="path" rules={[{ required: true }, { pattern: /^\/(?!\/)/ }]}>
            <Input placeholder="页面路径" />
          </Form.Item>
          <Button htmlType="submit">查询</Button>
        </Form>
        {count !== undefined && <Statistic title="浏览量" value={count} className="mt-4" />}
      </Card>
    </div>
  );
}
