import { getApplicationList } from "@/api/developer/application";
import useAuthStore from "@/stores/auth";
import { UserRole, UserRoleText } from "@/types/User";
import { Card, Typography, Row, Col, Flex } from "antd";
import { IconApps, IconUser, IconUsers } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

const { Title } = Typography;

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: applicationList } = useQuery({
    queryKey: ["application-list"],
    queryFn: () => getApplicationList(),
  });

  return (
    <div>
      <Title level={2}>欢迎回来，{user?.name || user?.email}</Title>
      <div className="mt-4">
        <Row gutter={16}>
          <Col flex={1}>
            <Card style={{ borderRadius: 8 }}>
              <Flex justify="space-between" align="center" gap={10}>
                {UserRoleText[user?.role as UserRole]}
                <IconUsers />
              </Flex>
            </Card>
          </Col>
          <Col flex={1}>
            <Card style={{ borderRadius: 8 }}>
              <Flex justify="space-between" align="center" gap={10}>
                {applicationList?.total || 0} 个应用
                <IconApps />
              </Flex>
            </Card>
          </Col>
          <Col flex={1}>
            <Card style={{ borderRadius: 8 }}>
              <Flex justify="space-between" align="center" gap={10}>
                {user?.disabledAt ? "账户已禁用" : "账户正常"}
                <IconUser />
              </Flex>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
