import axios from "axios";

const Axios = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL,
});

Axios.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // if (config.url) {
    //   config.url = getFormattedUrl(config.url);
    // }
    return config;
  },
  (error) => {
    if (error.response.status === 401) {
      window.location.href = "/auth/logout";
    }
    return Promise.reject(error);
  }
);

export default Axios;
