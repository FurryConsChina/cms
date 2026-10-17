import Axios from "@/api";

export async function cleanPageCache(path: string) {
  const res = await Axios.post<{}>("/cms/infra/cache/clean", { path });
  return res.data;
}

export async function refreshSitemap() {
  return (
    await Axios.get<{ success: boolean; message?: string }>("/cms/admin/infra/refresh-sitemap")
  ).data;
}

export async function getPageview(path: string) {
  return (
    await Axios.get<{ success: boolean; pageCount: number }>("/cms/infra/pageview", {
      params: { path },
    })
  ).data;
}
