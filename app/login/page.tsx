"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api.post("/api/login", { email, password }); // cookie akan diset oleh laravel
     console.log("test");
    //   router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // <— e bertipe otomatis
          required
        />
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}