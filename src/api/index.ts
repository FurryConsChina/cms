import axios from "axios";

// export const BASEURL = "https://api.furryeventchina.com";
export const BASEURL = "http://localhost:8787";

const Axios = axios.create({
  baseURL: BASEURL,
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
