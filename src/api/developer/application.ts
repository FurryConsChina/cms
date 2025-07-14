import Axios from "@/api";
import { Application } from "@/types/application";
import { List } from "@/types/Request";

export async function getApplicationList() {
  const res = await Axios.get<List<Application>>("/developer/application");
  return res.data;
}
