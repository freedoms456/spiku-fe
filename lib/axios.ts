import axios from "axios";

export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g. https://laravel-app.com
  baseURL: "https://sibtara.bpk.go.id", // e.g. https://laravel-app.com
  withCredentials: true, // <— penting agar cookie session ikut
});