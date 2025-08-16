"use client";
import { useState } from "react";
import api from "@/lib/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e:any) => {
    e.preventDefault();
    try {
      // perlu call CSRF dulu (Sanctum)
      await api.get("/sanctum/csrf-cookie");
      await api.post("/api/login", { email, password });
      setMessage("Login success!");
    } catch (err) {
      setMessage("Login failed!");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="p-6 border rounded max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Login
        </button>
        {message && <p className="mt-2 text-center">{message}</p>}
      </form>
    </div>
  );
}