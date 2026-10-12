import { useState } from "react";
import { Alert, App, Button, Card, Form, Input, Space, Statistic, Typography } from "antd";
import { cleanPageCache, getPageview, refreshSitemap } from "@/api/dashboard/cache";
import useAuthStore from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";
import { apiErrorMessage } from "@/utils/apiError";

export default function InfrastructurePage() {
  const { message, modal } = App.useApp();
  const admin = isAdmin(useAuthStore((state) => state.user?.role));
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState<number>();
  return (
    <div className="space-y-4">
      <Typography.Title level={3}>网站运维</Typography.Title>
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
      {admin && (
        <Card title="站点地图">
          <Button
            onClick={() =>
              modal.confirm({
                title: "重新生成并上传站点地图？",
                onOk: async () => {
                  try {
                    const result = await refreshSitemap();
                    if (!result.success) throw new Error(result.message || "生成失败");
                    message.success("站点地图已刷新");
                  } catch (e) {
                    message.error(apiErrorMessage(e));
                    throw e;
                  }
                },
              })
            }
          >
            刷新站点地图
          </Button>
        </Card>
      )}
    </div>
  );
}
