import { App, Button, Card, Typography } from "antd";
import useSWR from "swr";
import { AdminAuditLogApi } from "@/api/cms/admin/auditLog";
import { refreshSitemap } from "@/api/cms/cache";
import { PlaceAPI } from "@/api/cms/place";
import { apiErrorMessage } from "@/utils/apiError";
import type { AuditLog } from "@/types/access";
import type { List } from "@/types/request";

export default function AdminInfrastructurePage() {
  const { message, modal } = App.useApp();
  const {
    data: auditLogs,
    error: auditLogError,
    isLoading: auditLogLoading,
  } = useSWR<List<AuditLog>, unknown>("admin-last-sitemap-generation", () =>
    AdminAuditLogApi.list({
      current: 1,
      pageSize: 1,
      action: "infra.sitemap_generated",
    }),
  );
  const lastGeneration = auditLogs?.records[0];
  const lastGenerationText = auditLogLoading
    ? "查询中..."
    : auditLogError
      ? "查询失败"
      : lastGeneration
        ? new Date(lastGeneration.createdAt).toLocaleString("zh-CN")
        : "暂无记录";

  return (
    <div className="space-y-4">
      <Typography.Title level={3}>管理员运维</Typography.Title>
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
      <Card title="站点地图">
        <Typography.Paragraph type="secondary">
          上次定时生成：{lastGenerationText}
        </Typography.Paragraph>
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
    </div>
  );
}
