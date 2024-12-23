import useAuthStore from '@/stores/auth';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@mantine/form';

import { login as loginFn } from '@/api/auth';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from '@mantine/core';

export default function Auth() {
  const { login, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? '密码长度至少为6位' : null),
    },
  });

  const { mutate } = useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      login(data.user);
      refreshToken(data.token);
      navigate('/dashboard');
      notifications.show({
        message: '登录成功',
      });
    },
  });

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            alt="Your Company"
            src="https://images.furrycons.cn/logo_800x800.png"
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            欢迎回来，请登录
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form
              onSubmit={form.onSubmit((values) => {
                mutate(values);
              })}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  邮箱
                </label>
                <div className="mt-2">
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    key={form.key('email')}
                    {...form.getInputProps('email')}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  密码
                </label>
                <div className="mt-2">
                  <TextInput
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    key={form.key('password')}
                    {...form.getInputProps('password')}
                  />
                </div>
              </div>

              <div>
                <Button type="submit" fullWidth>
                  登录
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
