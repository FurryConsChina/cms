import { useNavigate, useParams } from 'react-router-dom';

import {
  EditableEventSchema,
  type EditableEventType,
  EventScale,
  type EventScaleKeyType,
  EventStatus,
  type EventStatusKeyType,
  type EventType,
} from '@/types/event';
import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Fieldset,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title,
  Text,
  Center,
  TagsInput,
  MultiSelect,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { OrganizationType } from '@/types/organization';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAllOrganizations } from '@/api/dashboard/organization';
import {
  createEvent,
  getEventDetail,
  updateEvent,
} from '@/api/dashboard/event';
import { z } from 'zod';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

import 'dayjs/locale/zh-cn';
import { EventScaleLabel, EventStatusLabel } from '@/consts/event';
import { Spin } from 'antd';
import UploadImage from '@/components/UploadImage';
import DefaultContainer from '@/components/Container';
import LoadError from '@/components/Error';
import { getFeatureList } from '@/api/dashboard/feature';

export default function EventEditPage() {
  const { eventId } = useParams();
  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['event-detail', eventId],
    queryFn: () => getEventDetail({ id: eventId as string }),
    refetchOnWindowFocus: false,
    enabled: !!eventId,
    gcTime: 0,
  });

  if (isError) {
    return <LoadError />;
  }

  return (
    <div className="relative">
      <DefaultContainer className="sticky top-0 z-10">
        <Title order={2}>{eventId ? '编辑展会' : '新建展会'}</Title>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isLoading ? (
          <Center>
            <Spin />
          </Center>
        ) : (
          <EventEditorContent event={event} />
        )}
      </DefaultContainer>
    </div>
  );
}

function EventEditorContent({ event }: { event?: EventType }) {
  const navigate = useNavigate();

  const { data: addressSearchResult, mutate } = useMutation({
    mutationFn: (params: { address: string; city: string }) =>
      fetch(
        `https://apis.map.qq.com/ws/place/v1/search?key=PXEBZ-QLM6C-RZX2K-AV2XX-SBBW5-VGFC4&keyword=${params.address}&boundary=region(${params.city},2)&page_size=10&page_index=1`,
      ),
  });
  const form = useForm({
    initialValues: {
      name: event?.name || '',
      startAt: event?.startAt
        ? new Date(event?.startAt)
        : new Date(new Date().setHours(10, 0, 0, 0)),
      endAt: event?.endAt
        ? new Date(event?.endAt)
        : new Date(new Date().setHours(18, 0, 0, 0)),
      //   city: event?.addressExtra?.city || "",
      citySlug: event?.addressExtra?.citySlug || '',
      address: event?.address || '',
      addressExtra: event?.addressExtra || { city: null },
      features: event?.features || { self: [] },
      commonFeatures: event?.commonFeatures?.map((f) => f.id) || [],
      source: event?.source || '',
      thumbnail: event?.thumbnail || 'fec-event-default-cover.png',
      poster: event?.poster?.all || [],
      organization: event?.organization?.id || '',
      slug: event?.slug || '',
      detail: event?.detail || '',
      status: event?.status || EventStatus.EventScheduled,
      scale: event?.scale || EventScale.Cosy,
      addressLat: event?.addressLat || '',
      addressLon: event?.addressLon || '',
    },
    // validate: zodResolver(
    //   z.object({
    //     name: z.string().min(1, { message: "文本不能为空" }),
    //     startAt: z.date(),
    //     endAt: z.date().nullable(),
    //     city: z.string(),
    //     citySlug: z.string(),
    //   })
    // ),
    // validate: zodResolver(EditableEventSchema),
  });

  type formType = typeof form.values;

  const { data: organizationList } = useQuery({
    queryKey: ['organization-list'],
    queryFn: () => getAllOrganizations({ search: '' }),
  });

  const { data: featureList } = useQuery({
    queryKey: ['feature-list'],
    queryFn: () => getFeatureList({ pageSize: 100, current: 1 }),
  });

  const organizationSelectOptions =
    organizationList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const selectedOrganization = organizationList?.find(
    (item) => item.id === form.values.organization,
  );

  const featureSelectOptions =
    featureList?.records.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const generateEventSlug = () => {
    const selectedYear = form.values.startAt?.getFullYear();
    const selectedMonth = form.values.startAt
      ?.toLocaleString('en-us', { month: 'short' })
      .toLocaleLowerCase();
    const city = form.values.citySlug;
    if (!selectedYear || !selectedMonth || !city) {
      return;
    }

    return `${selectedYear}-${selectedMonth}-${city}-con`;
  };

  const handleSubmit = async (formData: formType) => {
    console.log(formData);

    const transFormData: EditableEventType = {
      ...formData,
      startAt: formData.startAt.toISOString(),
      endAt: formData.endAt.toISOString(),
      poster: { all: formData.poster },
      addressExtra: {
        city: formData.addressExtra.city,
        citySlug: formData.citySlug,
      },
      organizations: [{ id: formData.organization, isPrimary: true }],
    };
    if (event?.id) {
      const res = await updateEvent({
        id: event.id,
        ...transFormData,
      });
      if (res) {
        notifications.show({
          title: '更新成功',
          message: '更新展会数据成功',
          color: 'teal',
        });
        navigate('/dashboard/event');
      }
      console.log('update res', res);
    } else {
      const res = await createEvent(transFormData);
      console.log('create res', res);
      if (res) {
        notifications.show({
          title: '创建成功',
          message: '创建展会数据成功',
          color: 'teal',
        });
        navigate('/dashboard/event');
      }
    }
  };

  console.log(form.values);

  return (
    <Box mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Container fluid>
          <Title order={5} my="sm">
            基础信息
          </Title>
          <Stack gap="xs">
            <TextInput
              withAsterisk
              label="展会名称"
              {...form.getInputProps('name')}
            />

            <Select
              withAsterisk
              label="展会展方"
              data={organizationSelectOptions}
              {...form.getInputProps('organization')}
            />

            <Group gap="xs" grow>
              <DateTimePicker
                withAsterisk
                valueFormat="YYYY年MM月DD日 hh:mm A"
                locale="zh-cn"
                label="开始日期"
                description="除非明确知晓展会开始时间，否则请保持默认上午10点"
                placeholder="选一个日期"
                clearable
                {...form.getInputProps('startAt')}
              />
              <DateTimePicker
                withAsterisk
                label="结束日期"
                description="除非明确知晓展会结束时间，否则请保持默认下午6点"
                locale="zh-cn"
                placeholder="选一个日期"
                valueFormat="YYYY年MM月DD日 hh:mm A"
                clearable
                {...form.getInputProps('endAt')}
              />
            </Group>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md" fluid>
          <Title order={5}>地理信息</Title>
          <Stack>
            <Autocomplete
              label="展会地址"
              rightSection={
                <IconSearch
                  size="14"
                  className="cursor-pointer"
                  onClick={() => {
                    const nowValues = form.getValues();
                    console.log(nowValues);
                    const searchSchema = z.object({
                      address: z.string(),
                      city: z.string(),
                    });

                    try {
                      mutate(
                        searchSchema.parse({
                          address: nowValues.address,
                          city: nowValues.addressExtra.city,
                        }),
                      );
                    } catch (error) {
                      notifications.show({
                        title: '有错误发生',
                        message: JSON.stringify(error),
                      });
                    }
                  }}
                />
              }
              {...form.getInputProps('address')}
            />

            <Group grow>
              <TextInput
                withAsterisk
                label="展会城市"
                placeholder="请填写后缀（如市）"
                {...form.getInputProps('addressExtra.city')}
              />

              <TextInput
                withAsterisk
                label="城市Slug"
                placeholder="请填写城市的拼音"
                {...form.getInputProps('citySlug')}
              />
            </Group>

            <Group gap="xs" grow>
              <TextInput
                label="经度"
                placeholder="一般是三位整数"
                {...form.getInputProps('addressLon')}
              />

              <TextInput
                label="纬度"
                placeholder="一般是两位整数"
                {...form.getInputProps('addressLat')}
              />
            </Group>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container fluid>
          <Title order={5}>URI构建</Title>
          <Stack>
            <TextInput
              withAsterisk
              label="展会Slug"
              disabled
              {...form.getInputProps('slug')}
            />
            <Button
              onClick={() => {
                const slug = generateEventSlug();
                if (!slug) {
                  return;
                }
                form.setFieldValue('slug', slug);
              }}
            >
              生成Slug
            </Button>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md" fluid>
          <Title order={5}>展会附加信息</Title>
          <Stack>
            <Select
              label="展会状态"
              withAsterisk
              placeholder="选一个"
              data={Object.keys(EventStatus).map((key) => ({
                label: EventStatusLabel[EventStatus[key as EventStatusKeyType]],
                value: EventStatus[key as EventStatusKeyType],
              }))}
              {...form.getInputProps('status')}
            />

            <Select
              label="展会规模"
              withAsterisk
              placeholder="选一个"
              data={Object.keys(EventScale).map((key) => ({
                label: EventScaleLabel[EventScale[key as EventScaleKeyType]],
                value: EventScale[key as EventScaleKeyType],
              }))}
              {...form.getInputProps('scale')}
            />

            <TagsInput
              label="展会专属标签"
              placeholder="请输入展会专属的标签"
              {...form.getInputProps('features.self')}
            />

            <MultiSelect
              label="展会公共标签"
              placeholder="请选择展会共有的标签"
              data={featureSelectOptions}
              {...form.getInputProps('commonFeatures')}
            />

            <TextInput
              // withAsterisk
              label="展会信源"
              {...form.getInputProps('source')}
            />

            <Textarea
              label="展会描述"
              autosize
              minRows={5}
              maxRows={20}
              {...form.getInputProps('detail')}
            />
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md" fluid>
          <Title order={5}>展会媒体资源</Title>

          <Stack justify="flex-start" gap="xs">
            <TextInput
              label="封面图片"
              withAsterisk
              {...form.getInputProps('thumbnail')}
            />
            <Group>
              <Chip
                checked={false}
                variant="filled"
                onClick={() => {
                  const organizationSlug = organizationList?.find(
                    (item) => item.id === form.values.organization,
                  )?.slug;
                  form.setFieldValue(
                    'thumbnail',
                    `organizations/${organizationSlug}/${form.values.slug}/cover.webp`,
                  );
                }}
              >
                通用格式
              </Chip>
              <Chip
                checked={false}
                variant="filled"
                onClick={() =>
                  form.setFieldValue('thumbnail', 'fec-event-default-cover.png')
                }
              >
                默认图片
              </Chip>
              <Chip
                checked={false}
                variant="filled"
                onClick={() =>
                  form.setFieldValue('thumbnail', 'fec-event-blank-cover.png')
                }
              >
                待揭晓图片
              </Chip>

              <Chip
                checked={false}
                variant="filled"
                onClick={() =>
                  form.setFieldValue('thumbnail', 'fec-event-cancel-cover.png')
                }
              >
                取消图片
              </Chip>

              <UploadImage
                pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
                defaultImageName="cover"
                onUploadSuccess={(s) => form.setFieldValue('thumbnail', s)}
                disabled={!selectedOrganization?.slug || !form.values.slug}
              />
            </Group>

            <Group>
              <Fieldset w="100%" legend="展会详情图片">
                <ActionIcon
                  size={'sm'}
                  onClick={() =>
                    form.setFieldValue(
                      'poster',
                      form.values.poster.concat(['']),
                    )
                  }
                >
                  <IconPlus />
                </ActionIcon>
                {form.values.poster.map((item, index) => (
                  <Group align="flex-end" key={index}>
                    <TextInput
                      style={{ flexGrow: 1 }}
                      label={`展会详情图片 ${index + 1}`}
                      {...form.getInputProps(`poster.${index}`)}
                    />
                    <UploadImage
                      pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
                      defaultImageName={`details-${index + 1}`}
                      onUploadSuccess={(s) =>
                        form.setFieldValue(`poster.${index}`, s)
                      }
                      disabled={
                        !selectedOrganization?.slug || !form.values.slug
                      }
                    />
                    <Button
                      color="red"
                      size={'sm'}
                      onClick={() =>
                        form.setFieldValue(
                          'poster',
                          form.values.poster.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <IconTrash />
                    </Button>
                  </Group>
                ))}
              </Fieldset>
            </Group>
          </Stack>
        </Container>

        <Container fluid>
          <Group justify="flex-end" mt="md">
            <Button type="submit">提交</Button>
          </Group>
        </Container>
      </form>
    </Box>
  );
}
