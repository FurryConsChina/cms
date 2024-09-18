import { Navigate } from "react-router-dom";

import useAuthStore from "@/stores/auth";
import "@/api/interceptors";

import FullScreenLoading from "@/components/Loading";
import DashboardLayout from "@/pages/dashboard/layout";

import "@/styles/global.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

const App = () => {
  const { user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return <FullScreenLoading />;
  }

  return user ? <DashboardLayout /> : <Navigate to="/login" />;
};

export default App;
