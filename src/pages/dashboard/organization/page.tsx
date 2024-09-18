import OrganizationList from "@/pages/dashboard/organization/components/List";
import { Title } from "@mantine/core";

export default function OrganizationPage() {
  return (
    <>
      <Title order={2}>展商列表</Title>
      <OrganizationList />
    </>
  );
}
