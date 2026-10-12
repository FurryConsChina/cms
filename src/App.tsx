import useSWR from "swr";
import { AuthAPI } from "@/api/auth";
import LoadError from "@/components/Layout/LoadError";
import { Navigate } from "react-router-dom";

import useAuthStore from "@/stores/auth";
import "@/api/interceptors";

import FullScreenLoading from "@/components/Layout/FullScreenLoading";
import DashboardLayout from "@/pages/dashboard/layout";

import "@/styles/global.css";

const App = () => {
  const { user, token, _hasHydrated } = useAuthStore();

  const {
    data: verifiedUser,
    error,
    isLoading,
  } = useSWR(
    _hasHydrated && token ? ["session-user", token] : null,
    async () => {
      const currentUser = await AuthAPI.getCurrentUser();
      useAuthStore.getState().login(currentUser);
      return currentUser;
    },
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  if (error && token) return <LoadError />;
  if (!_hasHydrated || (token && (!verifiedUser || isLoading))) {
    return <FullScreenLoading />;
  }

  return user && token ? <DashboardLayout /> : <Navigate to="/auth" />;
};

export default App;
