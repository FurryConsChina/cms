import { Typography, Flex, Spin } from "antd";
import useSWR from "swr";
import { AuthAPI } from "@/api/auth";
import DefaultContainer from "@/components/Layout/Container";
import LoadError from "@/components/Layout/LoadError";
import EditUserInfo from "./UpdatePassword";
import type { User } from "@/types/User";

const { Title } = Typography;

export default function UserDetail() {
  const { data: user, isLoading, error } = useSWR(
    ["user-detail"],
    () => AuthAPI.getCurrentUser(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (error) {
    return <LoadError />;
  }

  return (
    <div className="relative">
      <DefaultContainer className="sticky top-0 z-20">
        <Title level={3} style={{ margin: 0 }}>
          用户详情
        </Title>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isLoading ? (
          <Flex justify="center" align="center">
            <Spin />
          </Flex>
        ) : (
          <UserDetailContent user={user} />
        )}
      </DefaultContainer>
    </div>
  );
}

function UserDetailContent({ user }: { user?: User }) {
  return (
    <div>
      <EditUserInfo user={user} />
    </div>
  );
}
