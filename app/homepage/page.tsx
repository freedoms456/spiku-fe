import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        Selamat datang di SPIKU, ada yang bisa kami bantu?
      </h1>

      {/* Cards */}
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        
        {/* Card A */}
        <Link href="/table-master">
          <Card className="group hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Saya Ingin Melihat Data Pegawai Secara Spesifik
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </CardTitle>
             
            </CardHeader>
          </Card>
        </Link>

        {/* Card B */}
        <Link href="/employee-management">
          <Card className="group hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Saya Ingin Melihat Dasbor Pegawai
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </CardTitle>
             
            </CardHeader>
          </Card>
        </Link>

      </div>
    </div>
  );
}