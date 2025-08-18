// app/pegawai/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link"
import { api } from "@/lib/axios"
import Image from "next/image";
import { 
  User, 
  Briefcase, 
  Search, 
  Users, 
  GraduationCap, 
  MapPin, 
  UserPlus, 
  Shield,
  FileText,
  Phone,
  Mail,
  Calendar,
  Building,
  AlertTriangle,
  Clock,
  ChevronRight
} from "lucide-react";

type ApiAccount = {
  id: number
  account_name?: string
  account_nip_bpk?: string
  account_nip_bkn?: string
  account_email?: string
  account_unit?: string
  account_jenis_kelamin?: "L" | "P" | string | null
  account_pangkat?: string | null
  account_nik?: string | null
  account_golongan?: string | null
  account_handphone?: string | null
  account_tempat_lahir?: string | null
  account_tanggal_lahir?: string | null
  isActive?: boolean
  account_jabatan?: { id: number; name: string; awal_menjabat?: string | null; akhir_menjabat?: string | null }[]
  pemeriksaan?: any[]
  keluarga?: any[]
  account_pendidikan?: any[]
  account_sertifikasi?: any[]
  account_diklat?: any[]
  account_penempatan?: any[]
  account_perbantuan?: any[]
  account_memeriksa_akun?: any[]
  account_catatan_khusus?: any[]
}

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const [account, setAccount] = useState<ApiAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<ApiAccount[]>(`/api/accounts-by-id/${id}`)
        setAccount(res.data[0])
      } catch (e: any) {
        setError(e?.message || "Gagal memuat detail pegawai")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id])

  // Helper function to check if tab should be shown
  const shouldShowTab = (tabName: string): boolean => {
    if (!account) return false
    
    switch (tabName) {
      case 'jabatan':
        return account.account_jabatan && account.account_jabatan.length > 0
      case 'pemeriksaan':
        return account.pemeriksaan && account.pemeriksaan.length > 0
      case 'keluarga':
        return account.keluarga && account.keluarga.length > 0
      case 'pendidikan':
        return (account.account_pendidikan && account.account_pendidikan.length > 0) ||
               (account.account_sertifikasi && account.account_sertifikasi.length > 0) ||
               (account.account_diklat && account.account_diklat.length > 0)
      case 'penempatan':
        return account.account_penempatan && account.account_penempatan.length > 0
      case 'perbantuan':
        return account.account_perbantuan && account.account_perbantuan.length > 0
      case 'akun':
        return account.account_memeriksa_akun && account.account_memeriksa_akun.length > 0
      case 'catatan':
        return account.account_catatan_khusus && account.account_catatan_khusus.length > 0
      default:
        return true
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600 font-medium">Memuat data pegawai...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">Terjadi Kesalahan</h3>
            <p className="text-red-600">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Data Tidak Ditemukan</h3>
            <p className="text-gray-600 mb-4">Pegawai dengan ID tersebut tidak ditemukan dalam sistem.</p>
            <Link href="/table-master">
              <Button variant="outline">Kembali</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header Profile Card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 p-6 lg:p-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur group-hover:blur-none transition-all duration-300"></div>
                <Image
                  src={`https://sisdm.bpk.go.id/photo/${account.account_nip_bpk}/md.jpg`}
                  alt={account.account_name || 'Employee'}
                  width={120}
                  height={160}
                  className="relative rounded-xl object-cover border-4 border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">{account.account_name}</h1>
                  <div className="flex items-center gap-2 text-blue-100 mb-3">
                    <Building className="w-4 h-4" />
                    <span>{account.account_unit}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {account.account_golongan && (
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {account.account_golongan}
                    </Badge>
                  )}
                  {account.account_pangkat && (
                    <Badge variant="secondary" className="bg-blue-500/50 text-white border-blue-400">
                      {account.account_pangkat}
                    </Badge>
                  )}
                  <Badge className={account.isActive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                    {account.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Tabs defaultValue="profil" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-12 items-center justify-start w-max p-1 bg-white border border-blue-100 shadow-sm">
              <TabsTrigger 
                value="profil" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              
              {shouldShowTab('jabatan') && (
                <TabsTrigger 
                  value="jabatan"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Riwayat Jabatan</span>
                </TabsTrigger>
              )}
              
              {shouldShowTab('pemeriksaan') && (
                <TabsTrigger 
                  value="pemeriksaan"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Pemeriksaan</span>
                </TabsTrigger>
              )}
              
              {shouldShowTab('keluarga') && (
                <TabsTrigger 
                  value="keluarga"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluarga</span>
                </TabsTrigger>
              )}
              
              {shouldShowTab('pendidikan') && (
                <TabsTrigger 
                  value="pendidikan"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden sm:inline">Pendidikan</span>
                </TabsTrigger>
              )}
              
              {shouldShowTab('penempatan') && (
                <TabsTrigger 
                  value="penempatan"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Penempatan</span>
                </TabsTrigger>
              )}
              
              {shouldShowTab('perbantuan') && (
                <TabsTrigger 
                  value="perbantuan"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Perbantuan</span>
                </TabsTrigger>
              )}
              
              {shouldShowTab('akun') && (
                <TabsTrigger 
                  value="akun"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Memeriksa Akun</span>
                </TabsTrigger>
              )}
              
              {shouldShowTab('catatan') && (
                <TabsTrigger 
                  value="catatan"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Catatan Khusus</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Profil Tab */}
          <TabsContent value="profil" className="mt-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <User className="w-5 h-5" />
                  Informasi Profil
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Detail informasi pribadi pegawai
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-800">NIP BPK</p>
                        <p className="text-gray-700">{account.account_nip_bpk || "-"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-800">NIP BKN</p>
                        <p className="text-gray-700">{account.account_nip_bkn || "-"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-800">Email</p>
                        <p className="text-gray-700">{account.account_email || "-"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-800">No HP</p>
                        <p className="text-gray-700">{account.account_handphone || "-"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-800">Tempat, Tanggal Lahir</p>
                        <p className="text-gray-700">
                          {account.account_tempat_lahir ? `${account.account_tempat_lahir}, ` : ""}
                          {account.account_tanggal_lahir || "-"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <User className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-800">Jenis Kelamin</p>
                        <p className="text-gray-700">
                          {account.account_jenis_kelamin === "L" ? "Laki-laki" : 
                           account.account_jenis_kelamin === "P" ? "Perempuan" : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Riwayat Jabatan Tab */}
          {shouldShowTab('jabatan') && (
            <TabsContent value="jabatan" className="mt-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Briefcase className="w-5 h-5" />
                    Riwayat Jabatan
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Histori jabatan yang pernah diemban
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {account.account_jabatan?.map((j: any, index) => (
                      <div key={j.id} className="flex items-start gap-4 p-4 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors bg-gradient-to-r from-white to-blue-50">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{j.name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            {j.akhir_menjabat == null ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Masih menjabat
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {j.awal_menjabat} - {j.akhir_menjabat}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Pemeriksaan Tab */}
          {shouldShowTab('pemeriksaan') && (
            <TabsContent value="pemeriksaan" className="mt-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Search className="w-5 h-5" />
                    Riwayat Pemeriksaan
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Daftar pemeriksaan yang pernah dilakukan
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {account.pemeriksaan?.map((p: any) => (
                      <div key={p.id} className="p-4 rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-blue-800 mb-2">{p.jenis_pemeriksaan}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Entitas:</span> {p.entitas}</p>
                          <p><span className="font-medium">Pekerjaan:</span> {p.pekerjaan}</p>
                          <p><span className="font-medium">Tanggal:</span> {p.tanggal_pemeriksaan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Keluarga Tab */}
          {shouldShowTab('keluarga') && (
            <TabsContent value="keluarga" className="mt-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Users className="w-5 h-5" />
                    Data Keluarga
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Informasi keluarga pegawai
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {account.keluarga?.map((k: any) => (
                      <div key={k.id} className="p-4 rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50 text-center hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">{k.name}</h4>
                        <p className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {k.hubungan}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Pendidikan Tab */}
          {shouldShowTab('pendidikan') && (
            <TabsContent value="pendidikan" className="mt-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <GraduationCap className="w-5 h-5" />
                    Pendidikan & Sertifikasi
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Riwayat pendidikan, sertifikasi, dan pelatihan
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Pendidikan */}
                  {account.account_pendidikan && account.account_pendidikan.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg text-blue-800 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Pendidikan
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {account.account_pendidikan.map((p: any) => (
                          <div key={p.id} className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                            <h4 className="font-medium text-blue-800">{p.jenjang}</h4>
                            <p className="text-gray-700">{p.institusi}</p>
                            <p className="text-sm text-blue-600 mt-1">Lulus: {p.tahun_lulus}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Separator */}
                  {account.account_pendidikan?.length > 0 && account.account_sertifikasi?.length > 0 && (
                    <Separator className="my-6" />
                  )}

                  {/* Sertifikasi */}
                  {account.account_sertifikasi && account.account_sertifikasi.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg text-blue-800 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Sertifikasi
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {account.account_sertifikasi.map((s: any) => (
                          <div key={s.id} className="p-4 rounded-lg border border-green-100 bg-green-50">
                            <h4 className="font-medium text-green-800">{s.name}</h4>
                            <p className="text-sm text-green-600 mt-1">
                              {s.tanggal_sertifikasi} - {s.masa_berlaku}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Separator */}
                  {((account.account_pendidikan?.length > 0) || (account.account_sertifikasi?.length > 0)) && account.account_diklat?.length > 0 && (
                    <Separator className="my-6" />
                  )}

                  {/* Diklat */}
                  {account.account_diklat && account.account_diklat.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg text-blue-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Pelatihan (Diklat)
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {account.account_diklat.map((d: any) => (
                          <div key={d.id} className="p-4 rounded-lg border border-orange-100 bg-orange-50">
                            <h4 className="font-medium text-orange-800">{d.name}</h4>
                            <p className="text-sm text-orange-600 mt-1">{d.jp} Jam Pelajaran</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Penempatan Tab */}
          {shouldShowTab('penempatan') && (
            <TabsContent value="penempatan" className="mt-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <MapPin className="w-5 h-5" />
                    Riwayat Penempatan
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Histori penempatan di satuan kerja
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {account.account_penempatan?.map((p: any, index) => (
                      <div key={p.id} className="relative">
                        {/* Timeline line */}
                        {index !== account.account_penempatan?.length - 1 && (
                          <div className="absolute left-4 top-12 w-0.5 h-16 bg-blue-200"></div>
                        )}
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg border border-blue-100 bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-shadow">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-800 mb-1">{p.satuan_kerja}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>
                                {p.tanggal_masuk} - {p.tanggal_keluar || "Sekarang"}
                              </span>
                            </div>
                            {!p.tanggal_keluar && (
                              <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                                Penempatan Aktif
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Perbantuan Tab */}
          {shouldShowTab('perbantuan') && (
            <TabsContent value="perbantuan" className="mt-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <UserPlus className="w-5 h-5" />
                    Riwayat Perbantuan
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Histori perbantuan ke unit kerja lain
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {account.account_perbantuan?.map((p: any) => (
                      <div key={p.id} className="p-4 rounded-lg border border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserPlus className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-purple-800 mb-1">{p.unit_perbantuan}</h4>
                            <p className="text-sm text-gray-600 mb-2">{p.satuan_kerja}</p>
                            <div className="flex items-center gap-2 text-sm text-purple-600">
                              <Calendar className="w-4 h-4" />
                              <span>{p.tanggal_masuk} - {p.tanggal_keluar}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Memeriksa Akun Tab */}
          {shouldShowTab('akun') && (
            <TabsContent value="akun" className="mt-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Shield className="w-5 h-5" />
                    Memeriksa Akun
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Daftar akun yang diperiksa oleh pegawai
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {account.account_memeriksa_akun?.map((a: any) => (
                      <div key={a.id} className="p-4 rounded-lg border border-green-100 bg-gradient-to-r from-green-50 to-white hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-800 mb-2">{a.name}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{a.keterangan}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Catatan Khusus Tab */}
          {shouldShowTab('catatan') && (
            <TabsContent value="catatan" className="mt-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    Catatan Khusus
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    Catatan khusus dan tingkat risiko pegawai
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {account.account_catatan_khusus?.map((a: any) => (
                      <div key={a.id} className="p-4 rounded-lg border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-red-800">{a.name}</h4>
                              <Badge 
                                className={`ml-2 ${
                                  a.resiko?.toLowerCase() === 'tinggi' ? 'bg-red-100 text-red-800 border-red-300' :
                                  a.resiko?.toLowerCase() === 'sedang' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                  'bg-yellow-100 text-yellow-800 border-yellow-300'
                                }`}
                              >
                                Risiko {a.resiko || 'Tidak Diketahui'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed mb-2">{a.keterangan}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Back Button */}
        <div className="pt-6 pb-4">
          <Link href="/table-master">
            <Button variant="outline" className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Kembali ke Daftar Pegawai
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}