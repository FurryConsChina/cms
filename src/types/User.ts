export type User = {
  email: string;
  id: string;
  name: string;
  role: string;
  manageScope: { organizations?: string[] };
};
