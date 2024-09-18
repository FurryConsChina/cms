import axios from "axios";

// export const BASEURL = "https://api.furryeventchina.com";
export const BASEURL = "http://localhost:8787";

const Axios = axios.create({
  baseURL: BASEURL,
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VyIjoiRkVDLWRhc2hib2FyZCIsInJvbGUiOlsiUkVBRCIsIldSSVRFIl0sImlhdCI6MTcyNTYyMjU5MH0.UuOeR462Sz9hWEWlMbZ1D0wP6WBB_2yWb65y6xGehZQ`,
  },
});

// Axios.interceptors.request.use(
//   function (config) {
//     // 在发送请求之前做些什么
//     // if (config.url) {
//     //   config.url = getFormattedUrl(config.url);
//     // }
//     return config;
//   },
//   function (error) {
//     // 对请求错误做些什么
//     return Promise.reject(error);
//   }
// );

export default Axios;
