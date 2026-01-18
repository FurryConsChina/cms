import useAuthStore from "@/stores/auth";
import { Layout, Menu, Button, Flex } from "antd";
import type { MenuProps } from "antd";
import {
  IconApps,
  IconHome,
  IconLogout,
  IconMapPin,
  IconMenu2,
  IconTag,
  IconTicket,
  IconTrademark,
  IconUser,
  IconUserCode,
} from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";

const { Sider, Content, Header } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const menuItems: MenuItem[] = [
  {
    key: "/dashboard",
    icon: <IconHome size="1.1rem" stroke={1.5} />,
    label: "首页",
  },
  {
    key: "/dashboard/event",
    icon: <IconTicket size="1.1rem" stroke={1.5} />,
    label: "展会",
  },
  {
    key: "/dashboard/organization",
    icon: <IconTrademark size="1.1rem" stroke={1.5} />,
    label: "展商",
  },
  {
    key: "/dashboard/feature",
    icon: <IconTag size="1.1rem" stroke={1.5} />,
    label: "展会标签",
  },
  {
    key: "/dashboard/region",
    icon: <IconMapPin size="1.1rem" stroke={1.5} />,
    label: "地区管理",
  },
  {
    type: "divider",
  },
  {
    key: "/developer",
    icon: <IconUserCode size="1.1rem" stroke={1.5} />,
    label: "开发者",
    children: [
      {
        key: "/developer/application",
        icon: <IconApps size="1.1rem" stroke={1.5} />,
        label: "应用管理",
      },
    ],
  },
];

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

  const [collapsed, setCollapsed] = useState(false);

  const { logout } = useAuthStore();

  const getSelectedKeys = () => {
    const currentPath = location.pathname;

    // 特殊处理首页路径
    if (currentPath === "/dashboard") {
      return ["/dashboard"];
    }

    // 查找最匹配的路径
    const allKeys = [
      "/dashboard",
      "/dashboard/event",
      "/dashboard/organization",
      "/dashboard/feature",
      "/dashboard/region",
      "/developer/application",
    ];

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
      navigate(e.key);
    }
  };
  console.log(collapsed);
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsedWidth="100"
        width={300}
        className={clsx(
          "bg-slate-100 z-50 fixed md:sticky shadow-md md:shadow-none",
          collapsed ? "-translate-x-full md:translate-x-0" : "block"
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
                collapsed ? "justify-center" : "justify-end"
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
