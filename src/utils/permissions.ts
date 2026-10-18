import { UserRole } from "@/types/user";
export const isPlatform = (role?: string) => role === UserRole.Admin || role === UserRole.Editor;
export const isAdmin = (role?: string) => role === UserRole.Admin;
