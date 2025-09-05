// app/pegawai/[id]/page.tsx
"use client"

import { useEffect, useState,useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link"
import { api } from "@/lib/axios"
import Image from "next/image";
import Navbar from "@/components/employee-management/navbar"
import { 
  User, 
  Briefcase, 
  Search, 
  DollarSign,
  Users, 
  GraduationCap, 
  MapPin, 
  Calculator,
  UserPlus, 
  Shield,
  BookOpen,
  Monitor,
  TrendingUp,
  Heart,
  Baby,
  FileText,
  Phone,
  Mail,
  Calendar,
  Info,
  Building,
  AlertTriangle,
  Clock,
  ChevronRight,
  Activity,
  Building2,
  BarChart3,
  CheckCircle2
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
        // Ambil data dari localStorage dengan key "accounts"
        const accountsData = localStorage.getItem("accounts")
        
        if (!accountsData) {
          throw new Error("Data accounts tidak ditemukan di localStorage")
        }
        
        // Parse data JSON
        const accounts = JSON.parse(accountsData)
        
        // Cari account berdasarkan ID
        const foundAccount = accounts.find(account => account.id === parseInt(id))
        
        if (!foundAccount) {
          throw new Error(`Account dengan ID ${id} tidak ditemukan`)
        }
        
        // Set account data
        setAccount(foundAccount)
      } catch (e: any) {
        setError(e?.message || "Gagal memuat detail pegawai")
      } finally {
        setLoading(false)
      }
    }
    
    if (id) fetchDetail()
  }, [id])
          // Fungsi untuk konversi Excel date ke format tanggal
        const excelDateToJS = (excelDate) => {
          if (!excelDate || excelDate === "0") return null;
          const date = new Date((excelDate - 25569) * 86400 * 1000);
          return date;
        };

        const formatDate = (excelDate) => {
          const date = excelDateToJS(excelDate);
          if (!date) return "-";
          return date.toLocaleDateString('id-ID', { 
            day: '2-digit',
            month: 'short',
            year: 'numeric' 
          });
        };

  
        // Process and analyze pemeriksaan data
        const insights = useMemo(() => {
          if (!account?.pemeriksaan || account.pemeriksaan.length === 0) {
            return null;
          }

          // Group by entitas
          const byEntitas = account.pemeriksaan.reduce((acc, p) => {
            if (!acc[p.entitas]) {
              acc[p.entitas] = [];
            }
            acc[p.entitas].push(p);
            return acc;
          }, {});

          // Group by jenis pemeriksaan
          const byJenis = account.pemeriksaan.reduce((acc, p) => {
            const jenis = p.jenis_pemeriksaan.split(' ')[0]; // Get LKPD type
            if (!acc[jenis]) {
              acc[jenis] = 0;
            }
            acc[jenis]++;
            return acc;
          }, {});

          // Count by role
          const byPeran = account.pemeriksaan.reduce((acc, p) => {
            acc[p.pekerjaan] = (acc[p.pekerjaan] || 0) + 1;
            return acc;
          }, {});

          // Sort by date for timeline
          const sortedPemeriksaan = [...account.pemeriksaan].sort((a, b) => {
            return parseInt(b.tanggal_pemeriksaan) - parseInt(a.tanggal_pemeriksaan);
          });

          return {
            total: account.pemeriksaan.length,
            byEntitas,
            byJenis,
            byPeran,
            sortedPemeriksaan,
            uniqueEntitas: Object.keys(byEntitas).length,
            akunDiperiksa: account.account_memeriksa_akun || []
          };
        }, [account]);

      
      
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
      <Navbar showSearchBar={false}/>
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
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs uppercase tracking-wider">Total Pemeriksaan</p>
                          <p className="text-2xl font-bold mt-1">{insights.total}</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-xs uppercase tracking-wider">Entitas</p>
                          <p className="text-2xl font-bold mt-1">{insights.uniqueEntitas}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-purple-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-xs uppercase tracking-wider">Jenis Pemeriksaan</p>
                          <p className="text-2xl font-bold mt-1">{Object.keys(insights.byJenis).length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-green-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-xs uppercase tracking-wider">Akun Diperiksa</p>
                          <p className="text-2xl font-bold mt-1">{insights.akunDiperiksa.length}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-orange-200" />
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Timeline Pemeriksaan
                      </h3>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        <div className="space-y-4">
                          {insights.sortedPemeriksaan.map((p, index) => (
                            <div key={p.id} className="relative flex items-start gap-4">
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center z-10
                                ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}
                              `}>
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-gray-900">{p.jenis_pemeriksaan}</p>
                                      <p className="text-xs text-gray-600 mt-1">{p.entitas}</p>
                                      <div className="flex items-center gap-4 mt-2">
                                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                          <Calendar className="w-3 h-3" />
                                          {formatDate(p.tanggal_pemeriksaan)}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                          <User className="w-3 h-3" />
                                          {p.pekerjaan}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Rekapan by Entitas & Peran */}
                    <div className="space-y-6">
                      {/* Rekapan per Entitas */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-purple-600" />
                          Rekapan per Entitas
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(insights.byEntitas).map(([entitas, pemeriksaan]) => (
                            <div key={entitas} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-800">{entitas}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {pemeriksaan.length} pemeriksaan • {pemeriksaan.map(p => p.jenis_pemeriksaan).join(', ')}
                                </p>
                              </div>
                              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full text-sm font-bold">
                                {pemeriksaan.length}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Peran dalam Pemeriksaan */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-green-600" />
                          Peran dalam Pemeriksaan
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(insights.byPeran).map(([peran, count]) => {
                            const percentage = (count / insights.total) * 100;
                            return (
                              <div key={peran}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-700">{peran}</span>
                                  <span className="text-sm text-gray-600">{count}x ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Akun yang Diperiksa */}
                  {insights.akunDiperiksa.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-orange-600" />
                        Akun yang Diperiksa
                      </h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {insights.akunDiperiksa.map((akun) => (
                          <div key={akun.id} className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                            <p className="font-medium text-sm text-gray-800">{akun.name}</p>
                            {akun.keterangan && (
                              <p className="text-xs text-gray-600 mt-1">{akun.keterangan}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                  {/* <div className="grid gap-4 md:grid-cols-2">
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
                  </div> */}
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
                  Informasi keluarga dan tanggungan pegawai
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Family Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-700">{account.keluarga?.length || 0}</p>
                        <p className="text-sm text-emerald-600">Total Anggota Keluarga</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-700">
                          {account.keluarga?.filter(k => k.hubungan?.toLowerCase() === 'istri' || k.hubungan?.toLowerCase() === 'suami').length || 0}
                        </p>
                        <p className="text-sm text-purple-600">Pasangan</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <Baby className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-700">
                          {account.keluarga?.filter(k => k.hubungan?.toLowerCase() === 'anak').length || 0}
                        </p>
                        <p className="text-sm text-orange-600">Anak</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Family Members Detail */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Anggota Keluarga
                  </h3>
                  
                  {account.keluarga?.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {account.keluarga.map((k: any) => {
                    // Handle tanggal_lahir null/undefined
                        let age: number | null = null;
                        if (k?.tanggal_lahir) {
                          const parts = k.tanggal_lahir.split('-');
                          if (parts.length === 3) {
                            const birthDate = new Date(parts.reverse().join('-'));
                            if (!isNaN(birthDate.getTime())) {
                              age = new Date().getFullYear() - birthDate.getFullYear();
                            }
                          }
                        }
                        const relationIcon = k.hubungan?.toLowerCase() === 'istri' || k.hubungan?.toLowerCase() === 'suami' ? 
                          <Heart className="w-6 h-6 text-pink-500" /> : 
                          k.hubungan?.toLowerCase() === 'anak' ? 
                          <Baby className="w-6 h-6 text-orange-500" /> : 
                          <Users className="w-6 h-6 text-blue-500" />;
                        
                        return (
                          <div key={k.id} className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                                {relationIcon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-800 mb-1 truncate">{k.name}</h4>
                                <div className="space-y-2">
                                  <p className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                                    {k.hubungan}
                                  </p>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <p className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                
                                      {age !== null && (
                                        <span className="text-gray-500">({age} tahun)</span>
                                      )}
                                    </p>
                                    {k.domisili_sekarang && (
                                      <p className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {k.domisili_sekarang}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Belum ada data keluarga</p>
                      <p className="text-gray-400 text-sm mt-1">Data keluarga akan ditampilkan di sini</p>
                    </div>
                  )}
                </div>

                {/* Family Insights */}
                {account.keluarga?.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Insight Keluarga
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Pegawai memiliki {account.keluarga.length} anggota keluarga yang tercatat</p>
                      {account.keluarga.filter(k => k.hubungan?.toLowerCase() === 'anak').length > 0 && (
                        <p>• Memiliki {account.keluarga.filter(k => k.hubungan?.toLowerCase() === 'anak').length} orang anak sebagai tanggungan</p>
                      )}
                      <p>• Status keluarga: {account.account_status_pernikahan === "1" ? "Menikah" : "Belum Menikah"}</p>
                    </div>
                  </div>
                )}
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
                      Pendidikan & Kompetensi
                    </CardTitle>
                    <CardDescription className="text-blue-600">
                      Riwayat pendidikan, sertifikasi profesional, dan pengembangan kompetensi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Education & Certification Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-700">{account.account_pendidikan?.length || 0}</p>
                            <p className="text-sm text-blue-600">Pendidikan</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-700">{account.account_sertifikasi?.length || 0}</p>
                            <p className="text-sm text-green-600">Sertifikasi</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-orange-700">{account.account_diklat?.length || 0}</p>
                            <p className="text-sm text-orange-600">Pelatihan</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-700">
                              {account.account_diklat?.reduce((total, d) => total + (parseInt(d.jp) || 0), 0) || 0}
                            </p>
                            <p className="text-sm text-purple-600">Total JP</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Pendidikan */}
                      {account.account_pendidikan && account.account_pendidikan.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-lg text-blue-800 mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Riwayat Pendidikan
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            {account.account_pendidikan.map((p: any) => {
                              const getEducationLevel = (jenjang: string) => {
                                const level = jenjang?.toLowerCase();
                                if (level?.includes('s3') || level?.includes('doktor')) return { color: 'purple', level: 'Doktor', priority: 4 };
                                if (level?.includes('s2') || level?.includes('master')) return { color: 'blue', level: 'Magister', priority: 3 };
                                if (level?.includes('s1') || level?.includes('sarjana')) return { color: 'green', level: 'Sarjana', priority: 2 };
                                if (level?.includes('diploma') || level?.includes('d3')) return { color: 'orange', level: 'Diploma', priority: 1 };
                                return { color: 'gray', level: jenjang || 'Lainnya', priority: 0 };
                              };
                              
                              const educationInfo = getEducationLevel(p.jenjang);
                              const currentYear = new Date().getFullYear();
                              const yearsAgo = p.tahun_lulus ? currentYear - p.tahun_lulus : null;
                              
                              return (
                                <div key={p.id} className={`p-4 rounded-xl border bg-gradient-to-br from-white to-${educationInfo.color}-50 border-${educationInfo.color}-200 hover:shadow-lg transition-all duration-300`}>
                                  <div className="flex items-start gap-3">
                                    <div className={`w-12 h-12 bg-${educationInfo.color}-500 rounded-full flex items-center justify-center flex-shrink-0`}>
                                      <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 text-xs font-medium bg-${educationInfo.color}-100 text-${educationInfo.color}-700 rounded-full`}>
                                          {educationInfo.level}
                                        </span>
                                        {p.gpa && (
                                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                            GPA: {p.gpa}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-semibold text-gray-800 mb-1">{p.institusi}</h4>
                                      <p className="text-sm text-gray-600 mb-1">{p.jurusan}</p>
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>Lulus {p.tahun_lulus}</span>
                                        {yearsAgo && <span>({yearsAgo} tahun lalu)</span>}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sertifikasi dengan Kategorisasi */}
                      {account.account_sertifikasi && account.account_sertifikasi.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-lg text-green-800 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Sertifikasi Profesional
                          </h3>
                          
                          {(() => {
                            const categorizeByField = (certifications: any[]) => {
                              return certifications.reduce((acc, cert) => {
                                // Gunakan jenis_pelatihan jika ada, jika tidak gunakan 'Lainnya'
                                let category = cert.jenis_pelatihan || 'Lainnya';
                                let icon = Shield;
                                let color = 'gray';
                                
                                // Set icon dan color berdasarkan kategori dari jenis_pelatihan
                                const categoryLower = category.toLowerCase();
                                if (categoryLower.includes('audit') || categoryLower.includes('keuangan')) {
                                  icon = DollarSign;
                                  color = 'emerald';
                                } else if (categoryLower.includes('it') || categoryLower.includes('teknologi') || categoryLower.includes('security')) {
                                  icon = Monitor;
                                  color = 'blue';
                                } else if (categoryLower.includes('data') || categoryLower.includes('analytics')) {
                                  icon = BarChart3;
                                  color = 'purple';
                                } else if (categoryLower.includes('management') || categoryLower.includes('manajemen') || categoryLower.includes('kepemimpinan')) {
                                  icon = Users;
                                  color = 'orange';
                                } else if (categoryLower.includes('finance') || categoryLower.includes('akuntansi')) {
                                  icon = Calculator;
                                  color = 'green';
                                }
                                
                                if (!acc[category]) {
                                  acc[category] = { items: [], icon, color };
                                }
                                acc[category].items.push(cert);
                                return acc;
                              }, {});
                            };
                            
                            const categorizedCerts = categorizeByField(account.account_sertifikasi);
                            
                            return (
                              <div className="space-y-6">
                                {Object.entries(categorizedCerts).map(([category, data]: [string, any]) => (
                                  <div key={category} className="space-y-3">
                                    <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm">
                                      <data.icon className={`w-4 h-4 text-${data.color}-600`} />
                                      {category} ({data.items.length})
                                    </h4>
                                    <div className="grid gap-3 md:grid-cols-2">
                                      {data.items.map((s: any) => {
                                        const certDate = s.tanggal_sertifikasi ? new Date(s.tanggal_sertifikasi.split('-').reverse().join('-')) : null;
                                        const expDate = s.masa_berlaku ? new Date(s.masa_berlaku.split('-').reverse().join('-')) : null;
                                        const isExpired = expDate && expDate < new Date();
                                        const isExpiringSoon = expDate && !isExpired && (expDate.getTime() - new Date().getTime()) < (90 * 24 * 60 * 60 * 1000);
                                        
                                        return (
                                          <div key={s.id} className={`p-4 rounded-xl border bg-gradient-to-br from-white to-${data.color}-50 border-${data.color}-200 hover:shadow-lg transition-all duration-300 ${isExpired ? 'opacity-75' : ''}`}>
                                            <div className="flex items-start gap-3">
                                              <div className={`w-10 h-10 bg-${data.color}-500 rounded-full flex items-center justify-center flex-shrink-0`}>
                                                <data.icon className="w-5 h-5 text-white" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <h5 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">{s.name}</h5>
                                                <div className="space-y-1">
                                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Diterbitkan: {s.tanggal_sertifikasi || 'Tidak diketahui'}</span>
                                                  </div>
                                                  {s.masa_berlaku && (
                                                    <div className="flex items-center gap-1 text-xs">
                                                      <Clock className="w-3 h-3" />
                                                      <span className={isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}>
                                                        Berlaku hingga: {s.masa_berlaku}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {isExpired && (
                                                    <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                                      Expired
                                                    </span>
                                                  )}
                                                  {isExpiringSoon && (
                                                    <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                                      Segera Expired
                                                    </span>
                                                  )}
                                                  {!isExpired && !isExpiringSoon && s.masa_berlaku && (
                                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                                      Aktif
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Pelatihan dengan Kategorisasi */}
                      {account.account_diklat && account.account_diklat.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-lg text-orange-800 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Riwayat Pelatihan & Diklat
                          </h3>
                          
                          {(() => {
                            const categorizeTraining = (trainings: any[]) => {
                              return trainings.reduce((acc, training) => {
                                // Gunakan jenis_pelatihan jika ada, jika tidak gunakan 'Lainnya'
                                let category = training.jenis_pelatihan || 'Lainnya';
                                let icon = BookOpen;
                                let color = 'gray';
                                
                                // Set icon dan color berdasarkan kategori dari jenis_pelatihan
                                const categoryLower = category.toLowerCase();
                                if (categoryLower.includes('it') || categoryLower.includes('teknologi') || categoryLower.includes('security') || categoryLower.includes('digital')) {
                                  icon = Monitor;
                                  color = 'blue';
                                } else if (categoryLower.includes('audit') || categoryLower.includes('keuangan')) {
                                  icon = DollarSign;
                                  color = 'emerald';
                                } else if (categoryLower.includes('leadership') || categoryLower.includes('management') || categoryLower.includes('kepemimpinan') || categoryLower.includes('manajerial')) {
                                  icon = Users;
                                  color = 'purple';
                                } else if (categoryLower.includes('komunikasi') || categoryLower.includes('soft skill') || categoryLower.includes('presentation')) {
                                  icon = MessageCircle;
                                  color = 'pink';
                                }
                                
                                if (!acc[category]) {
                                  acc[category] = { items: [], icon, color, totalJP: 0 };
                                }
                                acc[category].items.push(training);
                                acc[category].totalJP += parseInt(training.jp) || 0;
                                return acc;
                              }, {});
                            };
                            
                            const categorizedTrainings = categorizeTraining(account.account_diklat);
                            
                            return (
                              <div className="space-y-6">
                                {Object.entries(categorizedTrainings).map(([category, data]: [string, any]) => (
                                  <div key={category} className="space-y-3">
                                    <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm">
                                      <data.icon className={`w-4 h-4 text-${data.color}-600`} />
                                      {category} ({data.items.length} pelatihan, {data.totalJP} JP)
                                    </h4>
                                    <div className="grid gap-3 md:grid-cols-2">
                                      {data.items.map((d: any) => (
                                        <div key={d.id} className={`p-4 rounded-xl border bg-gradient-to-br from-white to-${data.color}-50 border-${data.color}-200 hover:shadow-lg transition-all duration-300`}>
                                          <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 bg-${data.color}-500 rounded-full flex items-center justify-center flex-shrink-0`}>
                                              <data.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">{d.name}</h5>
                                              <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs bg-${data.color}-100 text-${data.color}-700 rounded-full`}>
                                                  {d.jp} JP
                                                </span>
                                                {d.jenis_pelatihan && (
                                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                    {d.jenis_pelatihan}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Competency Insights */}
                      {(account.account_pendidikan?.length > 0 || account.account_sertifikasi?.length > 0 || account.account_diklat?.length > 0) && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                          <h4 className="font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Analisis Kompetensi
                          </h4>
                          
                          {(() => {
                            const educationLevel = account.account_pendidikan?.[0]?.jenjang || 'Tidak diketahui';
                            const activeCertifications = account.account_sertifikasi?.filter(s => {
                              if (!s.masa_berlaku) return true;
                              const expDate = new Date(s.masa_berlaku.split('-').reverse().join('-'));
                              return expDate >= new Date();
                            }).length || 0;
                            
                            const totalJP = account.account_diklat?.reduce((total, d) => total + (parseInt(d.jp) || 0), 0) || 0;
                            
                            const competencyAreas = new Set();
                            account.account_sertifikasi?.forEach(s => {
                              if (s.jenis_pelatihan) {
                                competencyAreas.add(s.jenis_pelatihan);
                              }
                            });
                            
                            return (
                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <h5 className="font-medium text-indigo-700">Ringkasan Kompetensi</h5>
                                  <div className="text-sm text-indigo-600 space-y-2">
                                    <p>• Pendidikan tertinggi: <span className="font-medium">{educationLevel}</span></p>
                                    <p>• Sertifikasi aktif: <span className="font-medium">{activeCertifications} dari {account.account_sertifikasi?.length || 0}</span></p>
                                    <p>• Total jam pelatihan: <span className="font-medium">{totalJP} JP</span></p>
                                    <p>• Area keahlian: <span className="font-medium">{Array.from(competencyAreas).join(', ') || 'Belum teridentifikasi'}</span></p>
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <h5 className="font-medium text-indigo-700">Rekomendasi Pengembangan</h5>
                                  <div className="text-sm text-indigo-600 space-y-2">
                                    {account.account_sertifikasi?.some(s => {
                                      if (!s.masa_berlaku) return false;
                                      const expDate = new Date(s.masa_berlaku.split('-').reverse().join('-'));
                                      const monthsUntilExpiry = (expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
                                      return monthsUntilExpiry < 6 && monthsUntilExpiry > 0;
                                    }) && (
                                      <p>• <span className="text-orange-600">Perhatian:</span> Ada sertifikasi yang akan segera expired</p>
                                    )}
                                    {totalJP < 40 && (
                                      <p>• Disarankan menambah jam pelatihan untuk memenuhi standar minimal</p>
                                    )}
                                    {competencyAreas.size < 2 && (
                                      <p>• Pertimbangkan diversifikasi area keahlian untuk meningkatkan kompetensi</p>
                                    )}
                                    {!Array.from(competencyAreas).some(area => area.toLowerCase().includes('teknologi') || area.toLowerCase().includes('it')) && (
                                      <p>• Sertifikasi IT/Teknologi direkomendasikan untuk era digital</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Empty State */}
                      {(!account.account_pendidikan?.length && !account.account_sertifikasi?.length && !account.account_diklat?.length) && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">Belum ada data pendidikan dan sertifikasi</p>
                          <p className="text-gray-400 text-sm mt-1">Data pendidikan, sertifikasi, dan pelatihan akan ditampilkan di sini</p>
                        </div>
                      )}
                    </div>
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