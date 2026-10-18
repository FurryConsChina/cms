import Axios from "@/api";
import { z } from "zod";

import type { User } from "@/types/user";
import { InferZodType } from "@/types/common";

export const UpdatePasswordApiBody = z.object({
  currentPassword: z.string().min(1, "请输入当前密码").max(64),
  newPassword: z.string().min(8, "密码长度至少为8位").max(64),
});
export class AuthAPI {
  static async login(data: { email: string; password: string; captchaToken: string }) {
    const res = await Axios.post<{ token: string; user: User }>("/cms/auth/login", data);
    return res.data;
  }

  static async register(data: {
    name: string;
    password: string;
    email: string;
    captchaToken: string;
  }) {
    const res = await Axios.post<{ token: string; user: User }>("/cms/auth/register", data);
    return res.data;
  }

  static async requestPasswordReset(body: { email: string; captchaToken: string }) {
    return (await Axios.post<{ success: boolean }>("/cms/auth/reset-password-request", body)).data;
  }
  static async resetPassword(body: { email: string; resetToken: string; newPassword: string }) {
    return (await Axios.post<{ success: boolean }>("/cms/auth/reset-password", body)).data;
  }

  static async logout() {
    await Axios.post("/cms/auth/logout");
  }

  static async getCurrentUser() {
    const res = await Axios.get<{ user: User }>("/cms/auth/me");
    return res.data.user;
  }

  static async updatePassword(body: InferZodType<typeof UpdatePasswordApiBody>) {
    const res = await Axios.post<{ success: boolean }>("/cms/auth/update-password", body);
    return res.data;
  }
}
