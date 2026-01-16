import DefaultContainer from "@/components/Container";
import { Typography, Button, Flex } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function LoadError() {
  const navigate = useNavigate();

  return (
    <DefaultContainer className="sticky top-0 z-20">
      <Flex vertical align="center" justify="center">
        <Title level={3} className="text-slate-700">
          发生了错误...
        </Title>
        <Text type="secondary" style={{ fontSize: 16, textAlign: "center" }}>
          加载数据时发生了错误，最大的可能是这个数据不存在，如果持续遇到这个问题，请把地址报告给开发者。
        </Text>
        <Flex justify="center" style={{ marginTop: 16 }}>
          <Button type="text" size="middle" onClick={() => navigate(-1)}>
            返回
          </Button>
        </Flex>
      </Flex>
    </DefaultContainer>
  );
}
