import {
  IconBuildingCommunity,
  IconCalendarEvent,
  IconCode,
  IconHome,
  IconMapPin,
  IconHistory,
  IconMessageReport,
  IconPhoto,
  IconServerCog,
  IconTags,
  IconUserCheck,
  IconUserCircle,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import { isPlatform } from "@/utils/permissions";
import { UserRole } from "@/types/user";

type NavItem = { path: string; label: string; icon: Icon; platform?: boolean; roles?: UserRole[] };
type NavGroup = { label?: string; items: NavItem[] };

export const navigation: NavGroup[] = [
  { items: [{ path: "/dashboard", label: "首页", icon: IconHome }] },
  {
    label: "内容管理",
    items: [
      { path: "/dashboard/organization", label: "展商", icon: IconBuildingCommunity },
      { path: "/dashboard/event", label: "活动", icon: IconCalendarEvent },
      { path: "/dashboard/region", label: "地区", icon: IconWorld, platform: true },
      { path: "/dashboard/place", label: "地点", icon: IconMapPin },
      { path: "/dashboard/feature", label: "活动标签", icon: IconTags, platform: true },
      {
        path: "/dashboard/profile",
        label: "主体信息",
        icon: IconUserCircle,
        roles: [UserRole.Admin],
      },
    ],
  },
  {
    label: "开发者",
    items: [
      {
        path: "/developer/application",
        label: "我的应用",
        icon: IconCode,
        roles: [UserRole.Admin, UserRole.Editor, UserRole.User],
      },
    ],
  },
  {
    label: "管理员",
    items: [
      { path: "/admin/application", label: "应用管理", icon: IconCode, roles: [UserRole.Admin] },
      {
        path: "/admin/infrastructure",
        label: "运维工具",
        icon: IconServerCog,
        roles: [UserRole.Admin],
      },
      {
        path: "/admin/audit-log",
        label: "审计日志",
        icon: IconHistory,
        roles: [UserRole.Admin],
      },
      {
        path: "/dashboard/cache-manager",
        label: "页面缓存与浏览量",
        icon: IconServerCog,
        roles: [UserRole.Admin],
      },
      {
        path: "/dashboard/media",
        label: "媒体资源库",
        icon: IconPhoto,
        roles: [UserRole.Admin],
      },
      {
        path: "/dashboard/feedback",
        label: "页面反馈",
        icon: IconMessageReport,
        roles: [UserRole.Admin],
      },
      {
        path: "/dashboard/access",
        label: "认领与邀请",
        icon: IconUserCheck,
        roles: [UserRole.Admin],
      },
    ],
  },
];

export const visibleNavigation = (role?: string) =>
  navigation
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (!item.platform || isPlatform(role)) &&
          (!item.roles || item.roles.some((allowed) => allowed === role)),
      ),
    }))
    .filter((group) => group.items.length > 0);
