import {
  createOrganization,
  getOrganizationDetail,
  updateOrganization,
} from '@/api/dashboard/organization';
import DefaultContainer from '@/components/Container';
import LoadError from '@/components/Error';
import UploadImage from '@/components/UploadImage';
import {
  EditableOrganizationSchema,
  OrganizationStatus,
  OrganizationStatusLabel,
  OrganizationType,
  OrganizationTypeLabel,
} from '@/types/organization';
import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Group,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title,
  Tooltip,
  rem,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

export default function OrganizationEditPage() {
  const { organizationId } = useParams();
  const {
    data: organization,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['organization-detail', organizationId],
    queryFn: () => getOrganizationDetail({ id: organizationId as string }),
    refetchOnWindowFocus: false,
    enabled: !!organizationId,
  });

  if (isError) {
    return <LoadError />;
  }
  return (
    <div className="relative">
      <DefaultContainer className="sticky top-0 z-10">
        <Title order={2}>{organizationId ? '编辑展商' : '新建展商'}</Title>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isLoading ? (
          <Center>
            <Spin />
          </Center>
        ) : (
          <OrganizationEditorContent organization={organization} />
        )}
      </DefaultContainer>
    </div>
  );
}

function OrganizationEditorContent({
  organization,
}: {
  organization?: OrganizationType;
}) {
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      name: organization?.name || '',
      slug: organization?.slug || '',
      description: organization?.description || '',
      creationTime: organization?.creationTime
        ? new Date(organization.creationTime)
        : null,
      logoUrl: organization?.logoUrl || '',
      website: organization?.website || '',
      contactMail: organization?.contactMail || '',
      status: organization?.status || OrganizationStatus.Active,
      twitter: organization?.twitter || '',
      weibo: organization?.weibo || '',
      bilibili: organization?.bilibili || '',
      wikifur: organization?.wikifur || '',
      qqGroup: organization?.qqGroup || '',
      type: organization?.type || OrganizationType.Agency,
    },

    validate: {
      //   email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  type formType = typeof form.values;

  const handleSubmit = async (formData: formType) => {
    const validFormData = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) => value !== null && value !== '',
      ),
    );
    const validResult = EditableOrganizationSchema.safeParse({
      ...validFormData,
      creationTime: formData.creationTime
        ? formData.creationTime.toISOString()
        : null,
    });
    const validPayload = validResult.data;

    console.log(formData, validResult);

    if (validPayload) {
      if (organization?.id) {
        const res = await updateOrganization({
          ...validPayload,
          id: organization.id,
        });
        if (res) {
          notifications.show({
            title: '更新成功',
            message: '更新展商数据成功',
            color: 'teal',
            autoClose: false,
          });
        }
        console.log('update res', res);
      } else {
        const res = await createOrganization(validPayload);
        console.log('create res', res);
        if (res) {
          notifications.show({
            title: '创建成功',
            message: '创建展商数据成功',
            color: 'teal',
            autoClose: false,
          });
          navigate(`/dashboard/organization/${res.id}/edit`);
        }
      }
    } else {
      notifications.show({
        title: '数据校验不通过',
        message: '请检查表单',
        color: 'teal',
      });
    }
  };

  return (
    <Box mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Container fluid>
          <Title order={5} my="sm">
            基础信息
          </Title>
          <Stack gap="xs">
            <Group justify="space-between" grow>
              <TextInput
                withAsterisk
                label="展商名称"
                {...form.getInputProps('name')}
              />

              <DatePickerInput
                valueFormat="YYYY年MM月DD日"
                label="创立日期"
                placeholder="请选择日期"
                clearable
                locale="zh-cn"
                {...form.getInputProps('creationTime')}
              />
            </Group>

            <Group justify="space-between" grow>
              <Select
                withAsterisk
                label="展商状态"
                data={Object.values(OrganizationStatus).map((status) => ({
                  label: OrganizationStatusLabel[status],
                  value: status,
                }))}
                {...form.getInputProps('status')}
              />

              <Select
                withAsterisk
                label="展商类型"
                data={Object.values(OrganizationType).map((type) => ({
                  label: OrganizationTypeLabel[type],
                  value: type,
                }))}
                {...form.getInputProps('type')}
              />
            </Group>

            <Group justify="space-between" align="flex-start" grow>
              <TextInput
                withAsterisk
                label="展商Slug"
                disabled={!!organization?.id}
                placeholder="请输入展商Slug"
                description="请不要使用大写"
                {...form.getInputProps('slug')}
              />
            </Group>

            <Flex direction="row" gap="xs">
              <Alert variant="light" color="blue" radius="lg">
                Slug是展商的对外唯一标识，请谨慎选择，如果要修改请联系管理员。
              </Alert>
              <Alert variant="light" color="red" radius="lg">
                不到万不得已，请勿使用拼音。 如果英文名称太长，使用-连字符。
              </Alert>
            </Flex>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container fluid>
          <Title order={5}>媒体信息</Title>
          <Stack>
            <Group grow>
              <TextInput
                label="网站"
                placeholder="请输入网站链接"
                {...form.getInputProps('website')}
              />

              <TextInput
                label="联系邮箱"
                placeholder="请输入邮箱地址"
                {...form.getInputProps('contactMail')}
              />

              <TextInput
                label="QQ群"
                placeholder="请输入QQ群号"
                {...form.getInputProps('qqGroup')}
              />
            </Group>

            <Group gap="xs" grow>
              <TextInput
                label="Twitter"
                placeholder="请输入Twitter链接"
                {...form.getInputProps('twitter')}
              />

              <TextInput
                label="Weibo"
                placeholder="请输入微博链接"
                {...form.getInputProps('weibo')}
              />
            </Group>

            <Group gap="xs" grow>
              <TextInput
                label="Bilibili"
                placeholder="请输入B站链接"
                {...form.getInputProps('bilibili')}
              />

              <TextInput
                label="Wikifur"
                placeholder="请输入Wikifur链接"
                {...form.getInputProps('wikifur')}
              />
            </Group>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container fluid>
          <Title order={5}>展会附加信息</Title>
          <Stack>
            <Textarea
              label="展商描述"
              description="可以是展商的自我简介之类的东西，不填也没关系。"
              placeholder="请输入展商简介"
              autosize
              minRows={5}
              maxRows={20}
              {...form.getInputProps('description')}
            />
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container fluid>
          <Title order={5}>展会媒体资源</Title>

          <Stack justify="flex-start" gap="xs">
            <TextInput
              label="展商标志图片"
              description="一般来说无需手动编辑，除非有两个组织的logo一致，可以直接复用另外一个组织的URL。"
              {...form.getInputProps('logoUrl')}
            />
            <Group>
              <UploadImage
                pathPrefix={`organizations/${form.values.slug}/`}
                defaultImageName="logo"
                onUploadSuccess={(s) => form.setFieldValue('logoUrl', s)}
                disabled={!form.values.slug}
              />
            </Group>
          </Stack>
        </Container>

        <Container fluid>
          <Group justify="flex-end" mt="md">
            <Button type="submit">保存</Button>
          </Group>
        </Container>
      </form>
    </Box>
  );
}
