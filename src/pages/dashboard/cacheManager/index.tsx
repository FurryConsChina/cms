import { useState } from "react";
import { App, Button, Card, Form, Input, Statistic, Typography } from "antd";
import { cleanPageCache, getPageview, refreshSitemap } from "@/api/dashboard/cache";
import { PlaceAPI } from "@/api/dashboard/place";
import useAuthStore from "@/stores/auth";
import { isAdmin, isPlatform } from "@/utils/permissions";
import { apiErrorMessage } from "@/utils/apiError";

export default function InfrastructurePage() {
  const { message, modal } = App.useApp();
  const role = useAuthStore((state) => state.user?.role);
  const admin = isAdmin(role);
  const platform = isPlatform(role);
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
      {platform && (
        <Card title="地点地理索引">
          <Typography.Paragraph>
            根据所有未删除且经纬度完整的地点，重新生成地点坐标清单。用于批量导入或同步失败后的修复，日常编辑会自动同步。
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary">
            附近地点查询尚未接入此索引。重建不会修改地点资料。
          </Typography.Paragraph>
          <Button
            onClick={() =>
              modal.confirm({
                title: "重建地点地理索引？",
                content: "将清空旧的地点坐标清单，并根据数据库重新生成。如果重建失败，请再次执行。",
                onOk: async () => {
                  try {
                    const result = await PlaceAPI.rebuildGeoIndex();
                    message.success(`已索引 ${result.indexed} 个地点`);
                  } catch (e) {
                    message.error(apiErrorMessage(e));
                    throw e;
                  }
                },
              })
            }
          >
            重建地理索引
          </Button>
        </Card>
      )}
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
