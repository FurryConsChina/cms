import { getApplicationList } from "@/api/developer/application";
import useAuthStore from "@/stores/auth";
import { UserRole, UserRoleText } from "@/types/User";
import { Group, Paper, Title, Text, Flex } from "@mantine/core";
import { IconApps, IconUser, IconUsers, IconUserX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: applicationList } = useQuery({
    queryKey: ["application-list"],
    queryFn: () => getApplicationList(),
  });

  return (
    <div>
      <Title order={2}>欢迎回来，{user?.name || user?.email}</Title>
      <div className="mt-4">
        <Group grow>
          <Paper p={20} radius="md" className="relative">
            <Flex justify="space-between" align="center" gap={10}>
              {UserRoleText[user?.role as UserRole]}
              <IconUsers />
            </Flex>
          </Paper>
          <Paper p={20} radius="md" className="">
            <Flex justify="space-between" align="center" gap={10}>
              {applicationList?.total || 0} 个应用
              <IconApps />
            </Flex>
          </Paper>
          <Paper p={20} radius="md" className="">
            <Flex justify="space-between" align="center" gap={10}>
              {user?.disabledAt ? "账户已禁用" : "账户正常"}
              <IconUser />
            </Flex>
          </Paper>
        </Group>
      </div>
    </div>
  );
}
