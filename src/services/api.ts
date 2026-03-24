import axios, {type AxiosRequestConfig} from "axios";

export const instanceAxios = axios.create({
  baseURL: import.meta.env.VITE_APP_API,
  withCredentials: true,
});

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

instanceAxios.interceptors.response.use(
  (response) => {
    if (response.data.code && +response.data.code !== 200) {
      // If code is 401, we want to trigger the error interceptor's refresh logic
      if (+response.data.code === 401) {
        return Promise.reject({...response, isCustomError: true});
      }
      return Promise.reject(response);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status || (error.isCustomError ? +error.data?.code : null);

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !window.location.pathname.includes("/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return instanceAxios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Since the refresh token is in a cookie, we don't need the expired access token in the header.
        // This also avoids CORS issues if the backend doesn't explicitly allow Authorization header in CORS.
        const res = await instanceAxios.get("/auth/refresh");
        const {accessToken} = res.data.data || res.data; // Handle both direct {accessToken} and nested {data: {accessToken}}

        if (accessToken) {
          localStorage.setItem("token", accessToken);
          instanceAxios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);
          return instanceAxios(originalRequest);
        } else {
          throw new Error("No access token returned");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
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
