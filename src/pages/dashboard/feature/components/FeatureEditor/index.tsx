import { createFeature, updateFeature } from '@/api/dashboard/feature';
import type { CrateFeatureType, EditableFeatureType } from '@/types/feature';
import { Button, Group, Modal, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function FeatureEditor({
  opened,
  onClose,
  editingFeature,
}: {
  opened: boolean;
  onClose: () => void;
  editingFeature: EditableFeatureType | null;
}) {
  return (
    <>
      <Modal opened={opened} onClose={onClose} title="标签编辑" centered>
        {opened && (
          <ModalComponent editingFeature={editingFeature} onClose={onClose} />
        )}
      </Modal>
    </>
  );
}

function ModalComponent({
  editingFeature,
  onClose,
}: { editingFeature: EditableFeatureType | null; onClose: () => void }) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: editingFeature?.name || '',
      category: editingFeature?.category || '',
      description: editingFeature?.description || '',
    },
  });

  const handleSubmit = async (value: CrateFeatureType) => {
    if (editingFeature?.id) {
      const res = await updateFeature({ ...value, id: editingFeature.id });
      console.log(res);
      notifications.show({
        title: '更新成功',
        message: '更新标签成功',
        color: 'teal',
      });
      return onClose();
    }
    const res = await createFeature(value);
    console.log(res);
    notifications.show({
      title: '创建成功',
      message: '创建标签成功',
      color: 'teal',
    });
    return onClose();
  };

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <TextInput
        withAsterisk
        label="标签名称"
        placeholder="请输入标签名称"
        key={form.key('name')}
        {...form.getInputProps('name')}
      />

      <TextInput
        withAsterisk
        label="标签分类"
        placeholder="请输入标签类别"
        key={form.key('category')}
        {...form.getInputProps('category')}
      />

      <Textarea
        label="标签简述"
        description="标签简述可能会在未来展示于筛选设置中。"
        placeholder="请输入标签简述"
        key={form.key('description')}
        {...form.getInputProps('description')}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">提交</Button>
      </Group>
    </form>
  );
}
