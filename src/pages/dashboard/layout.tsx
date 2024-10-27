import { useState } from "react";
import {
  Group,
  Code,
  AppShell,
  AppShellNavbar,
  AppShellMain,
  AppShellSection,
  NavLink,
} from "@mantine/core";
import { Title } from "@mantine/core";
import {
  IconTicket,
  IconTrademark,
  IconLogout,
  IconCloudStorm,
  IconSwitchHorizontal,
} from "@tabler/icons-react";
import { Outlet, useNavigate } from "react-router-dom";

const linksData = [
  { link: "/dashboard/event", label: "展会", icon: IconTicket },
  { link: "/dashboard/organization", label: "展商", icon: IconTrademark },
  {
    link: "/dashboard/cache-manager",
    label: "缓存控制台",
    icon: IconCloudStorm,
  },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState(location.pathname);

  return (
    <AppShell navbar={{ width: 300, breakpoint: "sm" }} padding="xl">
      <AppShellNavbar withBorder={false} p="md" className="bg-slate-100">
        <AppShellSection>
          <Group justify="space-between" mb="xl">
            <Title className="text-slate-700">FEC CMS</Title>
            <Code fw={700} className="text-slate-500">
              v1.0.0
            </Code>
          </Group>
        </AppShellSection>

        <AppShellSection grow>
          <nav>
            {linksData.map((link) => (
              <NavLink
                key={link.link}
                active={link.link === activeRoute}
                onClick={() => {
                  navigate(link.link);
                  setActiveRoute(link.link);
                }}
                label={link.label}
                leftSection={<link.icon size="1.1rem" stroke={1.5} />}
                className="rounded"
              />
            ))}
          </nav>
        </AppShellSection>

        <AppShellSection>
          <div>
            <NavLink
              onClick={() => {}}
              label="切换账户"
              leftSection={<IconSwitchHorizontal size="1rem" stroke={1.5} />}
              className="rounded"
            />
            <NavLink
              onClick={() => {}}
              label="注销"
              leftSection={<IconLogout size="1rem" stroke={1.5} />}
              className="rounded"
            />
          </div>
        </AppShellSection>
      </AppShellNavbar>

      <AppShellMain className="bg-slate-100">
        <Outlet />
      </AppShellMain>
    </AppShell>
  );
}
