import { cleanPageCache } from '@/api/dashboard/cache';
import DefaultContainer from '@/components/Container';
import { Button, Grid, Group, SimpleGrid, Title } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

export default function CacheManager() {
  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Group justify="space-between">
          <Title order={2}>缓存刷新控制台</Title>
        </Group>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        <SimpleGrid cols={4}>
          <Button
            leftSection={<IconRefresh size={16} stroke={1.5} />}
            onClick={() => refreshPage('/')}
          >
            刷新首页
          </Button>

          <Button
            leftSection={<IconRefresh size={16} stroke={1.5} />}
            onClick={() => refreshPage('/city')}
          >
            刷新城市页面
          </Button>

          <Button
            leftSection={<IconRefresh size={16} stroke={1.5} />}
            onClick={() => refreshPage('/organization')}
          >
            刷新组织页面
          </Button>

          <Button
            leftSection={<IconRefresh size={16} stroke={1.5} />}
            onClick={() => refreshPage('/year')}
          >
            刷新年份页面
          </Button>
        </SimpleGrid>
      </DefaultContainer>
    </>
  );
}

async function refreshPage(path: string) {
  await cleanPageCache(path);
}
