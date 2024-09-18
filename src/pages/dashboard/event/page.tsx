import { Title } from "@mantine/core";
import { PAGE_SIZE } from "@/consts/normal";
import List from "./List";

export default function EventPage() {
  return (
    <>
      <Title order={2}>展会列表</Title>
      <List />
    </>
  );
}
