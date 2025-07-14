import App from "@/App";
import NotFound from "@/pages/404";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import CacheManagerPage from "@/pages/dashboard/cacheManager";
import ApplicationPage from "@/pages/dashboard/developer/application";
import EventEditPage from "@/pages/dashboard/event/edit";
import EventPage from "@/pages/dashboard/event/page";
import FeaturePage from "@/pages/dashboard/feature";
import OrganizationEditPage from "@/pages/dashboard/organization/edit";
import OrganizationPage from "@/pages/dashboard/organization/page";
import RegionPage from "@/pages/dashboard/region";
import RegionEditPage from "@/pages/dashboard/region/edit";
import ErrorPage from "@/pages/error";
import useAuthStore from "@/stores/auth";
import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/dashboard",
    Component: App,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "event",

        children: [
          {
            index: true,
            Component: EventPage,
          },
          {
            path: "create",
            Component: EventEditPage,
          },
          {
            path: ":eventId/edit",
            Component: EventEditPage,
          },
        ],
      },
      {
        path: "organization",

        children: [
          {
            index: true,
            Component: OrganizationPage,
          },
          {
            path: "create",
            Component: OrganizationEditPage,
          },
          {
            path: ":organizationId/edit",
            Component: OrganizationEditPage,
          },
        ],
      },
      {
        path: "feature",

        children: [
          {
            index: true,
            Component: FeaturePage,
          },
        ],
      },
      {
        path: "region",
        children: [
          {
            index: true,
            Component: RegionPage,
          },
          {
            path: "create",
            Component: RegionEditPage,
          },
          {
            path: ":id/edit",
            Component: RegionEditPage,
          },
        ],
      },
      {
        path: "cache-manager",
        Component: CacheManagerPage,
      },
    ],
  },
  {
    path: "developer",
    Component: App,
    children: [
      {
        index: true,
        path: "application",
        Component: ApplicationPage,
      },
    ],
  },
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
  {
    path: "*",
    Component: React.lazy(() => import("@/pages/404")),
  },
]);

export default router;
