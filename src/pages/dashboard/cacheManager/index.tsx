import { cleanPageCache } from "@/api/dashboard/cache";
import { Button } from "@mantine/core";

export default function CacheManager() {
  return (
    <>
      <Button onClick={() => refreshPage(`/`)}>刷新首页</Button>
    </>
  );
}

async function refreshPage(path: string) {
  await cleanPageCache(path);
}
