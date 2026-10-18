import { visibleNavigation } from "@/consts/navigation";
import useAuthStore from "@/stores/auth";
import { Layout, Menu, Button, Flex } from "antd";
import type { MenuProps } from "antd";
import { IconLogout, IconMenu2, IconUser } from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useMemo, useState } from "react";
import clsx from "clsx";

const { Sider, Content, Header } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const isMobile = () => window.innerWidth < 768;

const getMenuItems = (role?: string): MenuItem[] =>
  visibleNavigation(role).flatMap((group): MenuItem[] => {
    const items = group.items.map((item) => ({
      key: item.path,
      label: item.label,
      icon: <item.icon size="1.1rem" stroke={1.5} />,
    }));
    return group.label
      ? [{ type: "group" as const, key: group.label, label: group.label, children: items }]
      : items;
  });

const bottomMenuItems: MenuItem[] = [
  {
    key: "/dashboard/user/me",
    icon: <IconUser size="1rem" stroke={1.5} />,
    label: "个人设置",
  },
  {
    key: "logout",
    icon: <IconLogout size="1rem" stroke={1.5} />,
    label: "退出登录",
  },
];

const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  // position: "sticky",
  insetInlineStart: 0,
  top: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(isMobile);

  const { logout, user } = useAuthStore();

  const menuItems = useMemo(() => getMenuItems(user?.role), [user?.role]);

  const getSelectedKeys = () => {
    const currentPath = location.pathname;

    // 特殊处理首页路径
    if (currentPath === "/dashboard") {
      return ["/dashboard"];
    }

    // 查找最匹配的路径
    const allKeys = visibleNavigation(user?.role)
      .flatMap((group) => group.items.map((item) => item.path))
      .sort((a, b) => b.length - a.length);

    for (const key of allKeys) {
      if (key !== "/dashboard" && currentPath.startsWith(key)) {
        return [key];
      }
    }

    return [currentPath];
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "logout") {
      logout();
    } else if (e.key !== "user-settings") {
      void navigate(e.key);
      if (isMobile()) setCollapsed(true);
    }
  };
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsedWidth={80}
        width={232}
        className={clsx(
          "bg-slate-100 z-50 fixed md:sticky shadow-md md:shadow-none",
          collapsed ? "-translate-x-full md:translate-x-0" : "block",
        )}
        style={siderStyle}
        collapsible
        collapsed={collapsed}
      >
        <Flex justify="space-between" vertical className="px-2 h-full">
          <div>
            <Header
              className={clsx(
                "flex items-center bg-transparent p-0 md:p-2",
                collapsed ? "justify-center" : "justify-end",
              )}
            >
              <Button onClick={() => setCollapsed(!collapsed)}>
                <IconMenu2 size="1.1rem" stroke={1.5} />
              </Button>
            </Header>

            <Menu
              mode="inline"
              selectedKeys={getSelectedKeys()}
              items={menuItems}
              onClick={handleMenuClick}
              style={{ background: "transparent", border: "none" }}
            />
          </div>

          <Menu
            mode="inline"
            selectedKeys={[]}
            items={bottomMenuItems}
            onClick={handleMenuClick}
            style={{ background: "transparent", border: "none" }}
          />
        </Flex>
      </Sider>

      <Layout>
        <Header className={clsx("flex items-center bg-transparent p-2 md:hidden")}>
          <Button onClick={() => setCollapsed(!collapsed)}>
            <IconMenu2 size="1.1rem" stroke={1.5} />
          </Button>
        </Header>
        <Content className="bg-slate-100 p-2">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
