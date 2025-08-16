"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";

export function useAuth({ redirectTo = "/login" } = {}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api.get("/api/user")
      .then(res => { if (mounted) setUser(res.data); })
      .catch(() => { if (mounted) setUser(null); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [loading, user, router, redirectTo]);

  return { user, loading };
}