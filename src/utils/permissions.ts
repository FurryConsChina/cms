import { UserRole } from "@/types/User";
export const isPlatform = (role?: string) => role === UserRole.Admin || role === UserRole.Editor;
export const isAdmin = (role?: string) => role === UserRole.Admin;
