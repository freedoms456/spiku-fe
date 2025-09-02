"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth({ redirectTo = "/login" } = {}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("account");
    setUser(null);
    router.push("/login"); // langsung redirect ke login
  };

  // cek user di localStorage untuk auto-redirect
  useEffect(() => {
    if (!user) {
      router.replace(redirectTo);
    }
    setLoading(false);
  }, [user, router, redirectTo]);

  return { user, setUser, loading, logout };
}