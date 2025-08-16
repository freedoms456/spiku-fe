import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // ganti sesuai URL Laravel kamu
  withCredentials: true, // penting kalau pakai session/cookie (Laravel Sanctum)
});

export default api;