import { useState } from "react";
import {
  Group,
  Code,
  AppShell,
  AppShellNavbar,
  AppShellMain,
} from "@mantine/core";
import { Title } from "@mantine/core";
import {
  IconTicket,
  IconTrademark,
  IconLogout,
  IconCloudStorm,
} from "@tabler/icons-react";
import classes from "./layout.module.css";
import { Outlet, useLocation } from "react-router-dom";

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
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState(location.pathname);

  const links = linksData.map((item) => (
    <a
      className={classes.link}
      data-active={item.link === activeRoute || undefined}
      href={item.link}
      key={item.label}
      onClick={() => {
        setActiveRoute(item.link);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <AppShell navbar={{ width: 300, breakpoint: "sm" }} padding="xl">
      <AppShellNavbar withBorder={false} p="md">
        <nav className={classes.navbar}>
          <div className={classes.navbarMain}>
            <Group className={classes.header} justify="space-between">
              <Title>FEC CMS</Title>
              <Code fw={700}>v1.0.0</Code>
            </Group>
            {links}
          </div>

          <div className={classes.footer}>
            {/* <a
              href="#"
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
              <span>Change account</span>
            </a> */}

            <a
              href="#"
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <IconLogout className={classes.linkIcon} stroke={1.5} />
              <span>注销</span>
            </a>
          </div>
        </nav>
      </AppShellNavbar>

      <AppShellMain>
        <div className={classes.main}>
          <Outlet />
        </div>
      </AppShellMain>
    </AppShell>
  );
}
