import Axios from "@/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/User";

interface UserStore {
  _hasHydrated: boolean;
  user: User | null;
  token: string | null;
  setHasHydrated: (state: boolean) => void;
  login: (user: User) => void;
  refreshToken: (token: string) => void;
  logout: () => void;
}

const useAuthStore = create<UserStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      user: null,
      token: null,
      setHasHydrated: (state: boolean) => {
        set({
          _hasHydrated: state,
        });
      },
      login: (user: User) => {
        set({
          user,
        });
      },
      refreshToken: (token: string) => {
        set({
          token,
        });
        Axios.defaults.headers.common.Authorization = `${token}`;
      },
      logout: () => {
        set({
          user: null,
        });
        Axios.defaults.headers.common.Authorization = null;
        window.location.href = "/auth";
      },
    }),
    {
      name: "fcc-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.token) {
          Axios.defaults.headers.common.Authorization = `${state.token}`;
        }
      },
    }
  )
);

export default useAuthStore;
