import Axios from '.';
import useAuthStore from '@/stores/auth';

Axios.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    if (error?.response?.status === 401) {
      console.log('401');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
