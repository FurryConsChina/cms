import App from "@/App";
import FullScreenLoading from "@/components/Layout/FullScreenLoading";
import Auth from "@/pages/auth";
import ErrorPage from "@/pages/error";
import useAuthStore from "@/stores/auth";
import type { ComponentType } from "react";
import { createBrowserRouter, redirect } from "react-router-dom";

const page =
  <M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M = "default") =>
  async () => ({ Component: (await load())[name] as ComponentType });

const router = createBrowserRouter([
  {
    path: "/dashboard",
    Component: App,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <FullScreenLoading />,
    children: [
      { index: true, lazy: page(() => import("@/pages/dashboard")) },
      {
        path: "event",
        children: [
          { index: true, lazy: page(() => import("@/pages/dashboard/event/list")) },
          { path: "create", lazy: page(() => import("@/pages/dashboard/event/edit/page")) },
          { path: ":eventId/manage", lazy: page(() => import("@/pages/dashboard/event/manage/page")) },
          { path: ":eventId/edit", lazy: page(() => import("@/pages/dashboard/event/edit/page")) },
        ],
      },
      {
        path: "organization",
        children: [
          { index: true, lazy: page(() => import("@/pages/dashboard/organization/page")) },
          { path: "create", lazy: page(() => import("@/pages/dashboard/organization/edit")) },
          {
            path: ":entityId/access",
            lazy: page(() => import("@/pages/dashboard/access/entity"), "OrganizationAccessPage"),
          },
          { path: ":organizationId/edit", lazy: page(() => import("@/pages/dashboard/organization/edit")) },
        ],
      },
      { path: "profile", lazy: page(() => import("@/pages/dashboard/profile")) },
      {
        path: "profile/:entityId/access",
        lazy: page(() => import("@/pages/dashboard/access/entity"), "ProfileAccessPage"),
      },
      { path: "place", lazy: page(() => import("@/pages/dashboard/place")) },
      { path: "access", lazy: page(() => import("@/pages/dashboard/access")) },
      { path: "participation", lazy: page(() => import("@/pages/dashboard/access/participation")) },
      { path: "media", lazy: page(() => import("@/pages/dashboard/media")) },
      {
        lazy: page(() => import("@/components/Cms/PlatformGuard")),
        children: [
          { path: "feature", lazy: page(() => import("@/pages/dashboard/feature/list")) },
          { path: "region", lazy: page(() => import("@/pages/dashboard/region")) },
          { path: "region/create", lazy: page(() => import("@/pages/dashboard/region/edit")) },
          { path: "region/:regionId/edit", lazy: page(() => import("@/pages/dashboard/region/edit")) },
          { path: "feedback", lazy: page(() => import("@/pages/dashboard/feedback")) },
          { path: "cache-manager", lazy: page(() => import("@/pages/dashboard/cacheManager")) },
        ],
      },
      { path: "user/me", lazy: page(() => import("@/pages/user/detail")) },
    ],
  },
  {
    path: "developer",
    Component: App,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <FullScreenLoading />,
    children: [
      {
        index: true,
        path: "application",
        lazy: page(() => import("@/pages/dashboard/developer/application/list")),
      },
    ],
  },
  { path: "auth/reset-password", lazy: page(() => import("@/pages/auth/reset")) },
  {
    path: "auth",
    loader: () => {
      const user = useAuthStore.getState().user;
      if (user) {
        return redirect("/dashboard");
      }
      return null;
    },
    Component: Auth,
  },
  {
    path: "/",
    loader: () => {
      const user = useAuthStore.getState().user;
      if (user) {
        return redirect("/dashboard");
      }
      return redirect("/auth");
    },
  },
  { path: "*", lazy: page(() => import("@/pages/404")) },
]);

export default router;
