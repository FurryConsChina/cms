import Axios from "@/api";
import { z } from "zod";

import type { User } from "@/types/User";
import { InferZodType } from "@/types/common";

export const UpdatePasswordApiBody = z.object({
  newPassword: z.string().min(8, "密码长度至少为8位"),
});
export class AuthAPI {
  static async login(data: { email: string; password: string }) {
    const res = await Axios.post<{ token: string; user: User }>("/auth/login", data);
    return res.data;
  }

  static async getCurrentUser() {
    const res = await Axios.get<User>("/auth/me");
    return res.data;
  }

  static async updatePassword(body: InferZodType<typeof UpdatePasswordApiBody>) {
    const res = await Axios.post<User>("/auth/update-password", body);
    return res.data;
  }
}
