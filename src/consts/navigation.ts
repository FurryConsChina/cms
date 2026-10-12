import {
  IconBuildingCommunity,
  IconCalendarEvent,
  IconCode,
  IconHome,
  IconMapPin,
  // IconMessageReport,
  // IconPhoto,
  // IconServerCog,
  IconTags,
  // IconUserCheck,
  // IconUserCircle,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import { isPlatform } from "@/utils/permissions";

type NavItem = { path: string; label: string; icon: Icon; platform?: boolean };
type NavGroup = { label?: string; items: NavItem[] };

export const navigation: NavGroup[] = [
  { items: [{ path: "/dashboard", label: "首页", icon: IconHome }] },
  {
    label: "内容管理",
    items: [
      { path: "/dashboard/event", label: "活动", icon: IconCalendarEvent },
      { path: "/dashboard/organization", label: "组织", icon: IconBuildingCommunity },
      // 暂不开放的新功能入口，后续恢复。
      // { path: "/dashboard/profile", label: "主体资料", icon: IconUserCircle },
      { path: "/dashboard/place", label: "地点", icon: IconMapPin },
      // { path: "/dashboard/media", label: "媒体资源库", icon: IconPhoto },
      { path: "/dashboard/feature", label: "公共标签", icon: IconTags, platform: true },
      { path: "/dashboard/region", label: "地区", icon: IconWorld, platform: true },
      // { path: "/dashboard/feedback", label: "页面反馈", icon: IconMessageReport, platform: true },
      // { path: "/dashboard/cache-manager", label: "网站运维", icon: IconServerCog, platform: true },
    ],
  },
  // {
  //   label: "协作",
  //   items: [{ path: "/dashboard/access", label: "认领与邀请", icon: IconUserCheck }],
  // },
  {
    label: "开发者",
    items: [{ path: "/developer/application", label: "应用管理", icon: IconCode }],
  },
];

export const visibleNavigation = (role?: string) =>
  navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.platform || isPlatform(role)),
    }))
    .filter((group) => group.items.length > 0);
