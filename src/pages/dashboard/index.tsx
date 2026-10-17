import { Link } from "react-router-dom";
import useSWR from "swr";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { getStats } from "@/api/cms/analysis";
import { ApplicationApi } from "@/api/cms/application";
import useAuthStore from "@/stores/auth";
import { isAdmin, isPlatform } from "@/utils/permissions";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const platform = isPlatform(user?.role);
  const admin = isAdmin(user?.role);
  const { data: stats } = useSWR(platform ? ["dashboard-stats"] : null, getStats);
  const { data: applications } = useSWR(user ? ["dashboard-applications", "mine", user.id] : null, () =>
    ApplicationApi.getApplicationList(),
  );
  const cards = [
    ...(platform
      ? [
          { label: "活动", value: stats?.eventCount, path: "/dashboard/event" },
          { label: "组织", value: stats?.organizationCount, path: "/dashboard/organization" },
          { label: "地区", value: stats?.regionCount, path: "/dashboard/region" },
        ]
      : []),
    { label: "我的应用", value: applications?.total, path: "/developer/application" },
    ...(admin ? [{ label: "应用管理", value: stats?.applicationCount, path: "/admin/application" }] : []),
  ];
  return (
    <div className="space-y-4">
      <Typography.Title level={2}>欢迎回来，{user?.name || user?.email}</Typography.Title>
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
    </div>
  );
}
