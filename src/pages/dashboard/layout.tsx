import useAuthStore from "@/stores/auth";
import {
  AppShell,
  AppShellMain,
  AppShellNavbar,
  AppShellSection,
  Divider,
  NavLink,
} from "@mantine/core";
import {
  IconApps,
  IconHome,
  IconLogout,
  IconMapPin,
  IconTag,
  IconTicket,
  IconTrademark,
  IconUser,
  IconUserCode,
} from "@tabler/icons-react";
import clsx from "clsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

const linksData = [
  { link: "/dashboard", label: "首页", icon: IconHome },
  { link: "/dashboard/event", label: "展会", icon: IconTicket },
  { link: "/dashboard/organization", label: "展商", icon: IconTrademark },
  { link: "/dashboard/feature", label: "展会标签", icon: IconTag },
  { link: "/dashboard/region", label: "区域管理", icon: IconMapPin },
  {
    link: "/developer",
    label: "开发者",
    icon: IconUserCode,
    links: [
      { link: "/developer/application", label: "应用管理", icon: IconApps },
    ],
  },
  // {
  //   link: '/dashboard/cache-manager',
  //   label: '缓存管理',
  //   icon: IconCloudStorm,
  // },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuthStore();

  const isLinkActive = (linkPath: string) => {
    const currentPath = location.pathname;

    // // 特殊处理首页路径
    if (linkPath === "/dashboard") {
      return currentPath === "/dashboard";
    }

    // 检查是否为精确匹配
    if (currentPath === linkPath) {
      return true;
    }

    // 检查是否为子路径匹配，但排除更深层的子路径
    if (currentPath.startsWith(`${linkPath}/`)) {
      // 获取当前路径在 linkPath 之后的剩余部分
      const remainingPath = currentPath.slice(linkPath.length + 1);

      // 如果剩余路径不包含更多斜杠，说明是直接子路径
      // 如果包含更多斜杠，说明是更深层的子路径，不应该激活父路径
      return !remainingPath.includes("/");
    }

    return false;
  };

  return (
    <AppShell navbar={{ width: 300, breakpoint: "sm" }} padding="xl">
      <AppShellNavbar withBorder={false} p="xl" className="bg-slate-100">
        <AppShellSection grow>
          <nav className="flex flex-col gap-2">
            {linksData.map((link) => (
              <NavLink
                key={link.link}
                active={isLinkActive(link.link)}
                onClick={() => {
                  if (link.links) {
                    return;
                  }
                  navigate(link.link);
                }}
                label={link.label}
                leftSection={<link.icon size="1.1rem" stroke={1.5} />}
                className={clsx(
                  "rounded",
                  isLinkActive(link.link) && "shadow shadow-blue-500/20"
                )}
              >
                {link.links?.map((subLink) => (
                  <NavLink
                    key={subLink.link}
                    active={isLinkActive(subLink.link)}
                    onClick={() => {
                      navigate(subLink.link);
                    }}
                    label={subLink.label}
                    leftSection={<subLink.icon size="1.1rem" stroke={1.5} />}
                    className={clsx(
                      "rounded",
                      isLinkActive(subLink.link) && "shadow shadow-blue-500/20"
                    )}
                  />
                ))}
              </NavLink>
            ))}
          </nav>
        </AppShellSection>

        <AppShellSection my="xs">
          <Divider />
        </AppShellSection>

        <AppShellSection>
          <div>
            <NavLink
              label="个人设置"
              leftSection={<IconUser size="1rem" stroke={1.5} />}
              className="rounded"
              disabled
            />
            <NavLink
              onClick={logout}
              label="退出登录"
              leftSection={<IconLogout size="1rem" stroke={1.5} />}
              className="rounded"
            />
          </div>
        </AppShellSection>
      </AppShellNavbar>

      <AppShellMain className="bg-slate-100">
        <NuqsAdapter>
          <Outlet />
        </NuqsAdapter>
      </AppShellMain>
    </AppShell>
  );
}
