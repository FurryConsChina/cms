import { Flex, Spin } from "antd";

export default function FullScreenLoading() {
  return (
    <Flex align="center" justify="center" style={{ height: "100vh" }}>
      <Spin size="large" />
    </Flex>
  );
}
