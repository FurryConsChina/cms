import Axios from "@/api";

export type Stats = {
  eventCount: number;
  organizationCount: number;
  profileCount: number;
  regionCount: number;
  applicationCount: number;
  participantCount: number;
};

export async function getStats() {
  return (await Axios.get<Stats>("/cms/analysis")).data;
}
