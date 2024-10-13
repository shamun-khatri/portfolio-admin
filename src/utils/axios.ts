import type { HttpError } from "@refinedev/core";
import axios from "axios";

const axiosInstance = axios.create({withCredentials: true});

// You can also explicitly set the session-token cookie if needed
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
      const sessionToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("next-auth.session-token="))
          ?.split("=")[1];

      if (sessionToken) {
          config.headers["Authorization"] = `Bearer ${sessionToken}`;
      }
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {
    const customError: HttpError = {
      ...error,
      message: error.response?.data?.message,
      statusCode: error.response?.status,
    };

    return Promise.reject(customError);
  },
);


export { axiosInstance };
