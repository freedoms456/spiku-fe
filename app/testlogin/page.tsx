"use client";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, loading } = useAuth({ redirectTo: "/login" });

  if (loading) return <p>Loading...</p>; // sementara cek localStorage

  return (
    <div>
      <h1>Welcome {user?.account_nip}</h1> {/* langsung baca dari state */}
      <p>{user?.account_name}</p>          {/* contoh property lain */}
    </div>
  );
}