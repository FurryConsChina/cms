export type User = {
  email: string;
  id: string;
  name: string;
  role: string;
};

export enum UserRole {
  Admin = "admin",
  Editor = "editor",
  User = "user",
}

export const UserRoleText = {
  [UserRole.Admin]: "管理员",
  [UserRole.Editor]: "编辑",
  [UserRole.User]: "普通用户",
};
