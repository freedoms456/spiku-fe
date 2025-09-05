import axios from "axios";

// export const api = axios.create({
// //   baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g. https://laravel-app.com
//   baseURL: "https://sibtara.bpk.go.id", // e.g. https://laravel-app.com
//   withCredentials: true, // <— penting agar cookie session ikut
// });

const api = axios.create({
  baseURL: 'https://sibtara.bpk.go.id', // Laravel backend URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 419) {
      // CSRF token mismatch
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;