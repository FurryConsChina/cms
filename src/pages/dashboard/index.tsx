import { Link } from "react-router-dom";
import useSWR from "swr";
import { Alert, Button, Card, Col, Row, Space, Statistic, Typography } from "antd";
import { getStats } from "@/api/dashboard/analysis";
import { ApplicationApi } from "@/api/developer/application";
import useAuthStore from "@/stores/auth";
import { UserRole, UserRoleText } from "@/types/User";
import { isPlatform } from "@/utils/permissions";
import { apiErrorMessage } from "@/utils/apiError";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const platform = isPlatform(user?.role);
  const { data: stats, error } = useSWR(platform ? ["dashboard-stats"] : null, getStats);
  const { data: applications } = useSWR(["dashboard-applications"], () => ApplicationApi.getApplicationList());
  const cards = platform
    ? [
        { label: "活动", value: stats?.eventCount, path: "/dashboard/event" },
        { label: "组织", value: stats?.organizationCount, path: "/dashboard/organization" },
        // { label: "主体资料", value: stats?.profileCount, path: "/dashboard/profile" },
        { label: "地区", value: stats?.regionCount, path: "/dashboard/region" },
        // { label: "参加记录", value: stats?.participantCount },
        { label: "应用", value: stats?.applicationCount, path: "/developer/application" },
      ]
    : [{ label: "我的应用", value: applications?.total, path: "/developer/application" as string | undefined }];
  return (
    <div className="space-y-4">
      <Typography.Title level={2}>欢迎回来，{user?.name || user?.email}</Typography.Title>
      <Typography.Paragraph type="secondary">
        {UserRoleText[user?.role as UserRole]} · 活动与组织管理工作台
      </Typography.Paragraph>
      {error && <Alert type="error" title={apiErrorMessage(error)} />}
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} sm={12} lg={8} key={card.label}>
            <Card>
              <Statistic title={card.label} value={card.value ?? "—"} />
              {card.path && <Link to={card.path}>查看</Link>}
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="常用操作">
        <Space wrap>
          {[
            { label: "创建活动", path: "/dashboard/event/create" },
            // 暂不开放的新功能入口，后续恢复。
            // { label: "主体资料", path: "/dashboard/profile" },
            // { label: "认领与邀请", path: "/dashboard/access" },
            // { label: "媒体库", path: "/dashboard/media" },
            // ...(platform ? [{ label: "处理反馈", path: "/dashboard/feedback" }] : []),
            { label: "组织", path: "/dashboard/organization" },
            { label: "地点", path: "/dashboard/place" },
            ...(platform
              ? [
                  { label: "地区", path: "/dashboard/region" },
                  { label: "公共标签", path: "/dashboard/feature" },
                ]
              : []),
            { label: "应用管理", path: "/developer/application" },
          ].map((v) => (
            <Link key={v.path} to={v.path}>
              <Button>{v.label}</Button>
            </Link>
          ))}
        </Space>
      </Card>
    </div>
  );
}
