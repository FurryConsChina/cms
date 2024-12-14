import DefaultContainer from '@/components/Container';
import { Container, Title, Text, Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function LoadError() {
  const navigate = useNavigate();

  return (
    <DefaultContainer className="shadow sticky top-0 z-10">
      <Container className="flex flex-col items-center justify-center">
        <Title className="text-slate-700">发生了错误...</Title>
        <Text c="dimmed" size="lg" ta="center">
          加载数据时发生了错误，最大的可能是这个数据不存在，如果持续遇到这个问题，请把地址报告给开发者。
        </Text>
        <Group justify="center">
          <Button variant="subtle" size="md" onClick={() => navigate(-1)}>
            返回
          </Button>
        </Group>
      </Container>
    </DefaultContainer>
  );
}
