export type User = {
  email: string;
  id: string;
  name: string;
  role: string;
  manageScope: { organizations?: string[] };
  disabledAt: string | null;
};

export enum UserRole {
  Admin = "admin",
  Editor = "editor",
  Developer = "developer",
}

export const UserRoleText = {
  [UserRole.Admin]: "管理员",
  [UserRole.Editor]: "编辑",
  [UserRole.Developer]: "开发者",
};
