import useAuthStore from "@/stores/auth";
import { Layout, Menu, Divider } from "antd";
import type { MenuProps } from "antd";
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
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

const { Sider, Content } = Layout;

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
    label: "区域管理",
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
    key: "user-settings",
    icon: <IconUser size="1rem" stroke={1.5} />,
    label: "个人设置",
    disabled: true,
  },
  {
    key: "logout",
    icon: <IconLogout size="1rem" stroke={1.5} />,
    label: "退出登录",
  },
];

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={300} className="bg-slate-100" style={siderStyle}>
        <div className="flex flex-col h-full p-6">
          <div className="flex-1">
            <Menu
              mode="inline"
              selectedKeys={getSelectedKeys()}
              items={menuItems}
              onClick={handleMenuClick}
              style={{ background: "transparent", border: "none" }}
            />
          </div>

          <div>
            <Menu
              mode="inline"
              selectedKeys={[]}
              items={bottomMenuItems}
              onClick={handleMenuClick}
              style={{ background: "transparent", border: "none" }}
            />
          </div>
        </div>
      </Sider>

      <Content className="bg-slate-100 p-6">
        <NuqsAdapter>
          <Outlet />
        </NuqsAdapter>
      </Content>
    </Layout>
  );
}
