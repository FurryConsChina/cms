import App from "@/App";
import FullScreenLoading from "@/components/layout/FullScreenLoading";
import Auth from "@/pages/auth/login";
import ErrorPage from "@/pages/error";
import useAuthStore from "@/stores/auth";
import type { ComponentType } from "react";
import { createBrowserRouter, Navigate, redirect } from "react-router";

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
          { path: "create", lazy: page(() => import("@/pages/dashboard/event/edit")) },
          {
            path: ":eventId/manage",
            lazy: page(() => import("@/pages/dashboard/event/manage")),
          },
          { path: ":eventId/edit", lazy: page(() => import("@/pages/dashboard/event/edit")) },
        ],
      },
      {
        path: "organization",
        children: [
          { index: true, lazy: page(() => import("@/pages/dashboard/organization/list")) },
          { path: "create", lazy: page(() => import("@/pages/dashboard/organization/edit")) },
          {
            path: ":entityId/access",
            lazy: page(() => import("@/pages/dashboard/access/entity"), "OrganizationAccessPage"),
          },
          {
            path: ":organizationId/edit",
            lazy: page(() => import("@/pages/dashboard/organization/edit")),
          },
        ],
      },
      { path: "profile", lazy: page(() => import("@/pages/dashboard/profile/list")) },
      {
        path: "profile/:entityId/access",
        lazy: page(() => import("@/pages/dashboard/access/entity"), "ProfileAccessPage"),
      },
      { path: "place", lazy: page(() => import("@/pages/dashboard/place/list")) },
      { path: "access", lazy: page(() => import("@/pages/dashboard/access")) },
      { path: "participation", lazy: page(() => import("@/pages/dashboard/access/participation")) },
      { path: "media", lazy: page(() => import("@/pages/dashboard/media/list")) },
      {
        lazy: page(() => import("@/components/guards/PlatformGuard")),
        children: [
          { path: "feature", lazy: page(() => import("@/pages/dashboard/feature/list")) },
          { path: "region", lazy: page(() => import("@/pages/dashboard/region/list")) },
          { path: "feedback", lazy: page(() => import("@/pages/dashboard/feedback/list")) },
          { path: "cache-manager", lazy: page(() => import("@/pages/dashboard/cache-manager")) },
        ],
      },
      { path: "user/me", lazy: page(() => import("@/pages/dashboard/user/detail")) },
    ],
  },
  {
    path: "developer",
    Component: App,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <FullScreenLoading />,
    children: [
      {
        path: "application",
        lazy: page(() => import("@/pages/developer/application/list")),
      },
    ],
  },
  {
    path: "/admin",
    Component: App,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <FullScreenLoading />,
    children: [
      {
        lazy: page(() => import("@/components/guards/AdminGuard")),
        children: [
          { index: true, element: <Navigate to="/admin/application" replace /> },
          { path: "application", lazy: page(() => import("@/pages/admin/application/list")) },
          { path: "infrastructure", lazy: page(() => import("@/pages/admin/infrastructure")) },
        ],
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
