import useAuthStore from "@/stores/auth";
import {
  AppShell,
  AppShellMain,
  AppShellNavbar,
  AppShellSection,
  NavLink,
} from "@mantine/core";
import {
  IconCloudStorm,
  IconHome,
  IconLogout,
  IconTag,
  IconTicket,
  IconTrademark,
} from "@tabler/icons-react";
import clsx from "clsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const linksData = [
  { link: "/dashboard", label: "首页", icon: IconHome },
  { link: "/dashboard/event", label: "展会", icon: IconTicket },
  { link: "/dashboard/organization", label: "展商", icon: IconTrademark },
  { link: "/dashboard/feature", label: "展会标签", icon: IconTag },
  {
    link: "/dashboard/cache-manager",
    label: "缓存管理",
    icon: IconCloudStorm,
  },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuthStore();

  const isLinkActive = (linkPath: string) => {
    if (linkPath === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return (
      location.pathname === linkPath ||
      location.pathname.startsWith(`${linkPath}/`)
    );
  };

  return (
    <AppShell navbar={{ width: 300, breakpoint: "sm" }} padding="xl">
      <AppShellNavbar withBorder={false} p="xl" className="bg-slate-100">
        {/* <AppShellSection className="flex items-center gap-2">
          <Image
            className="w-8"
            src="https://images.furrycons.cn/logo_800x800.png"
          />
          <Title order={3}>兽展日历</Title>
        </AppShellSection> */}

        <AppShellSection grow>
          <nav className="flex flex-col gap-2">
            {linksData.map((link) => (
              <NavLink
                key={link.link}
                active={isLinkActive(link.link)}
                onClick={() => {
                  navigate(link.link);
                }}
                label={link.label}
                leftSection={<link.icon size="1.1rem" stroke={1.5} />}
                className={clsx(
                  "rounded",
                  isLinkActive(link.link) && "shadow shadow-blue-500/20"
                )}
              />
            ))}
          </nav>
        </AppShellSection>

        <AppShellSection>
          <div>
            <NavLink
              onClick={logout}
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
