"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download, 
  Filter, 
  Users, 
  UserCheck, 
  Award, 
  Building2,
  Eye,
  RefreshCw,
  BarChart3,
  TrendingUp
} from "lucide-react"
import { api } from "@/lib/axios"

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
  account_jabatan?: { id: number; name: string; awal_menjabat?: string | null; akhir_menjabat?: string | null }[]
}

type Employee = {
  id: number
  name: string
  nip_bpk: string
  nip_bkn: string
  jenis_kelamin: "Laki-laki" | "Perempuan" | ""
  unit: string
  jabatan: string
  golongan: "IV" | "III" | "II" | "I" | ""
  pangkat: string
}

export default function TableMasterPage() {
  const [rawData, setRawData] = useState<Employee[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGolongan, setSelectedGolongan] = useState<"all" | Employee["golongan"]>("all")
  const [selectedUnit, setSelectedUnit] = useState<string>("all")
  const [selectedGender, setSelectedGender] = useState<"all" | Employee["jenis_kelamin"]>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // --- Helpers untuk normalisasi ---
  const mapGender = (g?: string | null): Employee["jenis_kelamin"] =>
    g === "L" ? "Laki-laki" : g === "P" ? "Perempuan" : ""

  const extractRomanGol = (s?: string | null): Employee["golongan"] => {
    if (!s) return ""
    const m = s.match(/\b(IV|III|II|I)\b/i)
    return m ? (m[1].toUpperCase() as Employee["golongan"]) : ""
  }

  const pickJabatan = (arr?: ApiAccount["account_jabatan"]): string => {
    if (!arr || arr.length === 0) return ""
    const current = arr.find((j) => j.akhir_menjabat == null)
    return (current ?? arr[0]).name
  }

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<ApiAccount[]>("/api/accounts")
        const data = Array.isArray(res.data) ? res.data : []

        const normalized: Employee[] = data.map((a) => ({
          id: a.id,
          name: a.account_name ?? "",
          nip_bpk: a.account_nip_bpk ?? "",
          nip_bkn: a.account_nip_bkn ?? "",
          jenis_kelamin: mapGender(a.account_jenis_kelamin),
          unit: a.account_unit ?? "",
          jabatan: pickJabatan(a.account_jabatan),
          golongan: extractRomanGol(a.account_golongan),
          pangkat: a.account_pangkat ?? a.account_nik ?? "",
        }))

        setRawData(normalized)
        setCurrentPage(1)
      } catch (e: any) {
        setError(e?.message || "Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  // Units unik untuk filter
  const uniqueUnits = useMemo(() => {
    const setUnits = new Set<string>()
    rawData.forEach((item) => {
      if (item.unit) setUnits.add(item.unit)
    })
    return Array.from(setUnits).sort()
  }, [rawData])

  // Filtering
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return rawData.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(term) ||
        employee.nip_bpk.includes(searchTerm) ||
        employee.nip_bkn.includes(searchTerm) ||
        employee.jabatan.toLowerCase().includes(term) ||
        employee.unit.toLowerCase().includes(term)

      const matchesGolongan = selectedGolongan === "all" || employee.golongan === selectedGolongan
      const matchesUnit = selectedUnit === "all" || employee.unit === selectedUnit
      const matchesGender = selectedGender === "all" || employee.jenis_kelamin === selectedGender

      return matchesSearch && matchesGolongan && matchesUnit && matchesGender
    })
  }, [rawData, searchTerm, selectedGolongan, selectedUnit, selectedGender])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  // Badge variants
  const getGolonganBadgeVariant = (gol: Employee["golongan"]) => {
    switch (gol) {
      case "IV":
        return "default"
      case "III":
        return "secondary"
      case "II":
        return "outline"
      case "I":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getGenderBadgeVariant = (gender: Employee["jenis_kelamin"]) =>
    gender === "Laki-laki" ? "default" : "secondary"

  // Statistics
  const totalEmployees = rawData.length
  const maleCount = rawData.filter((emp) => emp.jenis_kelamin === "Laki-laki").length
  const femaleCount = rawData.filter((emp) => emp.jenis_kelamin === "Perempuan").length
  const golonganStats = {
    IV: rawData.filter((emp) => emp.golongan === "IV").length,
    III: rawData.filter((emp) => emp.golongan === "III").length,
    II: rawData.filter((emp) => emp.golongan === "II").length,
    I: rawData.filter((emp) => emp.golongan === "I").length,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">Data Master Pegawai</h1>
                <p className="text-blue-100 mb-4">Sistem Informasi Kepegawaian Terintegrasi</p>
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{totalEmployees} Total Pegawai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">{uniqueUnits.length} Unit Kerja</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <BarChart3 className="w-16 h-16 text-white/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Terjadi Kesalahan</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-blue-600" />
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-blue-800">{totalEmployees}</div>
              <p className="text-sm text-blue-600 font-medium">Total Pegawai</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-cyan-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="h-8 w-8 text-cyan-600" />
                <div className="text-xs text-cyan-500">
                  {totalEmployees ? Math.round((maleCount / totalEmployees) * 100) : 0}%
                </div>
              </div>
              <div className="text-2xl font-bold text-cyan-800">{maleCount}</div>
              <p className="text-sm text-cyan-600 font-medium">Laki-laki</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-pink-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="h-8 w-8 text-pink-600" />
                <div className="text-xs text-pink-500">
                  {totalEmployees ? Math.round((femaleCount / totalEmployees) * 100) : 0}%
                </div>
              </div>
              <div className="text-2xl font-bold text-pink-800">{femaleCount}</div>
              <p className="text-sm text-pink-600 font-medium">Perempuan</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-800">{golonganStats.IV}</div>
              <p className="text-sm text-green-600 font-medium">Golongan IV</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-800">{golonganStats.III}</div>
              <p className="text-sm text-yellow-600 font-medium">Golongan III</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-800">{golonganStats.I + golonganStats.II}</div>
              <p className="text-sm text-orange-600 font-medium">Golongan I-II</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Filter className="w-5 h-5" />
              Filter & Pencarian Data
            </CardTitle>
            <CardDescription className="text-blue-600">
              Gunakan filter di bawah untuk mencari dan memfilter data pegawai
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                <Input
                  placeholder="Cari nama, NIP, jabatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <Select value={selectedGolongan} onValueChange={(v) => setSelectedGolongan(v as any)}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Filter Golongan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Golongan</SelectItem>
                  <SelectItem value="IV">Golongan IV</SelectItem>
                  <SelectItem value="III">Golongan III</SelectItem>
                  <SelectItem value="II">Golongan II</SelectItem>
                  <SelectItem value="I">Golongan I</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Filter Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Unit</SelectItem>
                  {uniqueUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGender} onValueChange={(v) => setSelectedGender(v as any)}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Filter Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedGolongan("all")
                  setSelectedUnit("all")
                  setSelectedGender("all")
                  setCurrentPage(1)
                }}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-blue-800">Tabel Data Master Pegawai</CardTitle>
                <CardDescription className="text-blue-600">
                  Menampilkan {filteredData.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari{" "}
                  {filteredData.length} data pegawai
                </CardDescription>
              </div>
              {/* <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button> */}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-lg border border-blue-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 hover:bg-blue-50">
                    <TableHead className="w-[50px] text-blue-800 font-semibold">No</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Nama</TableHead>
                    <TableHead className="text-blue-800 font-semibold">NIP BKN</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Jenis Kelamin</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Unit</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Jabatan</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Golongan</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((employee, index) => (
                    <TableRow key={employee.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-blue-600">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium text-gray-800">{employee.name}</TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">{employee.nip_bkn}</TableCell>
                      <TableCell>
                        <Badge variant={getGenderBadgeVariant(employee.jenis_kelamin)} className="font-medium">
                          {employee.jenis_kelamin || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-gray-700" title={employee.unit}>
                        {employee.unit || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700">{employee.jabatan || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getGolonganBadgeVariant(employee.golongan)} className="font-medium">
                          {employee.golongan || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/pegawai/${employee.id}`}>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}

                  {currentData.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">Tidak ada data pegawai</p>
                          <p className="text-gray-400 text-sm">Coba ubah filter pencarian</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-blue-100">
              <div className="text-sm text-blue-600 font-medium">
                Menampilkan {filteredData.length === 0 ? 0 : startIndex + 1} sampai {Math.min(endIndex, filteredData.length)} dari{" "}
                {filteredData.length} data
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-md">
                  <span className="text-sm font-medium text-blue-800">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}