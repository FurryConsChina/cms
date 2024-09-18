import Axios from '@/api';
import { User } from '@/types/User';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        Axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      },
      logout: () => {
        set({
          user: null,
        });
        Axios.defaults.headers.common['Authorization'] = null;
      },
    }),
    {
      name: 'auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.token) {
          Axios.defaults.headers.common['Authorization'] =
            `Token ${state.token}`;
        }
      },
    },
  ),
);

export default useAuthStore;
