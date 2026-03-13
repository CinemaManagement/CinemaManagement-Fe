import axios, { type AxiosRequestConfig } from "axios";

export const instanceAxios = axios.create({
  baseURL: import.meta.env.VITE_APP_API,
});

instanceAxios.interceptors.response.use(
  (response) => {
    if (response.data.code && +response.data.code !== 200) {
      return Promise.reject(response);
    }
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default function request(options: AxiosRequestConfig) {
  return instanceAxios({
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
}
