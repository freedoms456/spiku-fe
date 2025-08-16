"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      // Panggil API logout di Laravel
      await api.post("/api/logout", {}, { withCredentials: true });

      // Hapus user di local storage / state global jika ada
      localStorage.removeItem("user");

      // Redirect ke login
      router.push("/login");
    } catch (err) {
      console.error("Logout gagal", err);
    }
  };

  return { logout };
}