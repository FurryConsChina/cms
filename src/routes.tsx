import App from "@/App";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import CacheManagerPage from "@/pages/dashboard/cacheManager";
import EventPage from "@/pages/dashboard/event/page";
import OrganizationPage from "@/pages/dashboard/organization/page";
import ErrorPage from "@/pages/error";
import useAuthStore from "@/stores/auth";
// import Login from '@pages/auth/login';
// import BannerManager from '@pages/content/banner';
// import LandingDashboard from '@pages/landing-page';
// import User from '@pages/user';
// import UserDetail from '@pages/user/detail';
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
        Component: EventPage,
      },
      {
        path: "organization",
        Component: OrganizationPage,
      },
      {
        path: "cache-manager",
        Component: CacheManagerPage,
      },
    ],
  },
  {
    path: "login",
    loader: () => {
      const user = useAuthStore.getState().user;
      if (user) {
        return redirect("/");
      }
      return null;
    },
    Component: Auth,
  },
]);

export default router;
