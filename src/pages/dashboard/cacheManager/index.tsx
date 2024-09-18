import { Button } from "@mantine/core";

export default function CacheManager() {
  return (
    <>
      <Button onClick={() => refreshPage(`/`)}>刷新首页</Button>
    </>
  );
}

async function refreshPage(path: string) {
  const res = await fetch("/api/refresh-page", {
    method: "POST",
    body: JSON.stringify({ path }),
  });

  console.log(res);
}
