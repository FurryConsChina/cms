import { cleanPageCache } from '@/api/dashboard/cache';
import DefaultContainer from '@/components/Container';
import { Button, Flex, Typography, Row, Col } from 'antd';
import { IconRefresh } from '@tabler/icons-react';

const { Title } = Typography;

export default function CacheManager() {
  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Flex justify="space-between" align="center">
          <Title level={2} style={{ margin: 0 }}>缓存刷新控制台</Title>
        </Flex>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Button
              icon={<IconRefresh size={16} stroke={1.5} />}
              onClick={() => refreshPage('/')}
              block
            >
              刷新首页
            </Button>
          </Col>

          <Col span={6}>
            <Button
              icon={<IconRefresh size={16} stroke={1.5} />}
              onClick={() => refreshPage('/city')}
              block
            >
              刷新城市页面
            </Button>
          </Col>

          <Col span={6}>
            <Button
              icon={<IconRefresh size={16} stroke={1.5} />}
              onClick={() => refreshPage('/organization')}
              block
            >
              刷新组织页面
            </Button>
          </Col>

          <Col span={6}>
            <Button
              icon={<IconRefresh size={16} stroke={1.5} />}
              onClick={() => refreshPage('/year')}
              block
            >
              刷新年份页面
            </Button>
          </Col>
        </Row>
      </DefaultContainer>
    </>
  );
}

async function refreshPage(path: string) {
  await cleanPageCache(path);
}
