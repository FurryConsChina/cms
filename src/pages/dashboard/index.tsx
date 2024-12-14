import useAuthStore from "@/stores/auth";
import { Title } from "@mantine/core";

export default function Dashboard() {
  const { user } = useAuthStore();
  return (
    <div>
      <Title order={2}>欢迎回来，{user?.name || user?.email}</Title>
    </div>
  );
}
