import Axios from "@/api";

import type { User } from "@/types/User";

export async function login(data: { email: string; password: string }) {
  const res = await Axios.post<{ token: string; user: User }>(
    "/auth/login",
    data
  );
  return res.data;
}
