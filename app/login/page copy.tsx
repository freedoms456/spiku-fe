"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

    // 🔹 Cek user di localStorage, kalau ada redirect
    useEffect(() => {
      const user = localStorage.getItem("user");
      if (user) {
        router.replace("/homepage"); // replace biar ga bisa back ke login
      }
    }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // ambil csrf cookie dulu kalau pakai sanctum
      await api.get("/sanctum/csrf-cookie", { withCredentials: true });

      // login ke backend
      const res = await api.post(
        "/api/login",
        { email, password },
        { withCredentials: true }
      )
      // simpan user di localStorage
      localStorage.setItem("user", JSON.stringify(res.data));

      
      const accounts = await api.get("/api/accounts", { withCredentials: true });

      localStorage.setItem("accounts", JSON.stringify(accounts.data));

      // redirect ke halaman setelah login
      router.push("/homepage");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
   <main className="min-h-screen flex items-center justify-center p-6">
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Kiri: Logo */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-50 p-6">
          <img
            src="/logo.png"
            alt="Logo"
            width={300}
            height={300}
            className="object-contain"
          />
        </div>

        {/* Kanan: Form */}
        <div className="w-full md:w-1/2 p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <h1 className="text-2xl font-semibold text-center">Masuk</h1>
            {err && <p className="text-red-600 text-sm">{err}</p>}

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Username"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Kata Sandi"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Sedang masuk..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </main>
  
  );
}