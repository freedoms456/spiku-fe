"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search, Download, Filter, Users } from "lucide-react"
import { tableMasterData } from "@/lib/table-master-data"

export default function TableMasterPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGolongan, setSelectedGolongan] = useState("all")
  const [selectedUnit, setSelectedUnit] = useState("all")
  const [selectedGender, setSelectedGender] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Get unique units for filter
  const uniqueUnits = Array.from(new Set(tableMasterData.map((item) => item.unit)))

  const filteredData = useMemo(() => {
    return tableMasterData.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.nip_bpk.includes(searchTerm) ||
        employee.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.unit.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesGolongan = selectedGolongan === "all" || employee.golongan === selectedGolongan
      const matchesUnit = selectedUnit === "all" || employee.unit === selectedUnit
      const matchesGender = selectedGender === "all" || employee.jenis_kelamin === selectedGender

      return matchesSearch && matchesGolongan && matchesUnit && matchesGender
    })
  }, [searchTerm, selectedGolongan, selectedUnit, selectedGender])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const getGolonganBadgeVariant = (golongan: string) => {
    switch (golongan) {
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

  const getGenderBadgeVariant = (gender: string) => {
    return gender === "Laki-laki" ? "default" : "secondary"
  }

  // Statistics
  const totalEmployees = tableMasterData.length
  const maleCount = tableMasterData.filter((emp) => emp.jenis_kelamin === "Laki-laki").length
  const femaleCount = tableMasterData.filter((emp) => emp.jenis_kelamin === "Perempuan").length
  const golonganStats = {
    IV: tableMasterData.filter((emp) => emp.golongan === "IV").length,
    III: tableMasterData.filter((emp) => emp.golongan === "III").length,
    II: tableMasterData.filter((emp) => emp.golongan === "II").length,
    I: tableMasterData.filter((emp) => emp.golongan === "I").length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Data Master Pegawai</h1>
              <p className="text-muted-foreground">Sistem Pelaporan Informasi Kepegawaian Universitas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Pegawai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Laki-laki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maleCount}</div>
              <p className="text-xs text-muted-foreground">{Math.round((maleCount / totalEmployees) * 100)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Perempuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{femaleCount}</div>
              <p className="text-xs text-muted-foreground">{Math.round((femaleCount / totalEmployees) * 100)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Golongan IV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{golonganStats.IV}</div>
              <p className="text-xs text-muted-foreground">Pembina</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Golongan III</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{golonganStats.III}</div>
              <p className="text-xs text-muted-foreground">Penata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Golongan I-II</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{golonganStats.I + golonganStats.II}</div>
              <p className="text-xs text-muted-foreground">Pengatur & Juru</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Data</CardTitle>
            <CardDescription>Gunakan filter di bawah untuk mencari data pegawai</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NIP, jabatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={selectedGolongan} onValueChange={setSelectedGolongan}>
                <SelectTrigger>
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
                <SelectTrigger>
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

              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
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
              >
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tabel Data Master Pegawai</CardTitle>
            <CardDescription>
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
              pegawai
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIP BPK</TableHead>
                    <TableHead>NIP BKN</TableHead>
                    <TableHead>Jenis Kelamin</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Golongan</TableHead>
                    <TableHead>Pangkat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((employee, index) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell className="font-mono text-sm">{employee.nip_bpk}</TableCell>
                      <TableCell className="font-mono text-sm">{employee.nip_bkn}</TableCell>
                      <TableCell>
                        <Badge variant={getGenderBadgeVariant(employee.jenis_kelamin)}>{employee.jenis_kelamin}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={employee.unit}>
                        {employee.unit}
                      </TableCell>
                      <TableCell>{employee.jabatan}</TableCell>
                      <TableCell>
                        <Badge variant={getGolonganBadgeVariant(employee.golongan)}>{employee.golongan}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={employee.pangkat}>
                        {employee.pangkat}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {startIndex + 1} sampai {Math.min(endIndex, filteredData.length)} dari {filteredData.length}{" "}
                data
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <div className="text-sm">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
