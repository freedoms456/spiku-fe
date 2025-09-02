"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  GraduationCap,
  Award,
  MapPin,
  Building,
  User,
  BookOpen,
  Star,
  CheckCircle,
  Target,
  TrendingUp,
  FileText,
  Activity,
  Search,
  Filter,
  X,
  BarChart3
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function TeamFormationInsights() {
  const { user,logout} = useAuth({ redirectTo: "/login" });
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJabatan, setSelectedJabatan] = useState("all")
  const [selectedPangkat, setSelectedPangkat] = useState("all")
  const [selectedJurusan, setSelectedJurusan] = useState([]) // Changed to array for multi-select
  const [selectedDomisili, setSelectedDomisili] = useState("all")
  const [matrixTab, setMatrixTab] = useState("all")
  
  // Active filters display
  const [activeFilters, setActiveFilters] = useState([])

  // Sample data with more comprehensive data
  const sampleAccounts = [
    {
      id: 66,
      account_name: "Rizia Praja Rosalin",
      account_jabatan: [{ name: "Pemeriksa Pertama" }],
      account_pangkat: "Penata Muda (III/a)",
      account_golongan: "Golongan III",
      account_pendidikan: [{ jenjang: "S1", institusi: "UIN Sunan Kalijaga Yogyakarta", jurusan: "Akuntansi" }],
      keluarga: [
        { name: "Rini Ariyanti", hubungan: "Istri", domisili_sekarang: "Tarakan" },
        { name: "Ohana Maria Rosalin", hubungan: "Anak" },
        { name: "Violet Sarah Rosalin", hubungan: "Anak" }
      ],
      pemeriksaan: [
        { entitas: "Kabupaten Malinau", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Interim TA 2024" },
        { entitas: "Kabupaten Malinau", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Terinci TA 2024" },
        { entitas: "Provinsi Kalimantan Utara", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "Pendahuluan Kepatuhan" },
        { entitas: "Kota Tarakan", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Interim TA 2023" },
        { entitas: "Kota Tarakan", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Terinci TA 2023" },
        { entitas: "Provinsi Kalimantan Utara", pekerjaan: "Ketua Tim", jenis_pemeriksaan: "Pendahuluan DTT" },
        { entitas: "Provinsi Kalimantan Utara", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "Kepatuhan DTT" }
      ],
      account_diklat: [
        { name: "Persiapan Pemeriksaan LKPD TA 2024", jp: "56" },
        { name: "Self Learning Mandatory Integritas", jp: "10" }
      ]
    },
    {
      id: 67,
      account_name: "Seno Zulfikar",
      account_jabatan: [{ name: "Pemeriksa Pertama" }],
      account_pangkat: "Penata Muda (III/a)",
      account_golongan: "Golongan III",
      account_pendidikan: [{ jenjang: "S1", institusi: "Universitas Trisakti", jurusan: "Ekonomi" }],
      keluarga: [
        { name: "Hikmatul Maulah", hubungan: "Istri", domisili_sekarang: "Tarakan" },
        { name: "Sausan Iskarimah", hubungan: "Anak" }
      ],
      pemeriksaan: [
        { entitas: "Kota Tarakan", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Interim TA 2024" },
        { entitas: "Kota Tarakan", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Terinci TA 2024" },
        { entitas: "Provinsi Kalimantan Utara", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Interim TA 2023" },
        { entitas: "Provinsi Kalimantan Utara", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Terinci TA 2023" },
        { entitas: "Kabupaten Tana Tidung", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "Kepatuhan Pendahuluan" },
        { entitas: "Kabupaten Tana Tidung", pekerjaan: "Ketua Tim", jenis_pemeriksaan: "Kepatuhan Belanja Daerah" }
      ],
      account_diklat: [
        { name: "Persiapan Pemeriksaan LKPD TA 2024", jp: "56" },
        { name: "Self Learning Mandatory Integritas", jp: "10" }
      ]
    },
    {
      id: 68,
      account_name: "Siti Nur Kholisah",
      account_jabatan: [{ name: "Pemeriksa Pertama" }],
      account_pangkat: "Penata Muda (III/a)",
      account_golongan: "Golongan III",
      account_pendidikan: [{ jenjang: "S1", institusi: "Universitas Hasanuddin", jurusan: "Akuntansi" }],
      keluarga: [
        { name: "Muh. Arham Aras", hubungan: "Suami", domisili_sekarang: "Makassar" },
        { name: "Azqiara Valeeqa Puteri Arsa", hubungan: "Anak" }
      ],
      pemeriksaan: [
        { entitas: "Kabupaten Malinau", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Interim TA 2024" },
        { entitas: "Kabupaten Malinau", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Terinci TA 2024" },
        { entitas: "Provinsi Kalimantan Utara", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "Kepatuhan Pendahuluan LH" },
        { entitas: "Kota Tarakan", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Interim TA 2023" },
        { entitas: "Kota Tarakan", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD Terinci TA 2023" },
        { entitas: "Kabupaten Nunukan", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "Kinerja Pendahuluan JKN" },
        { entitas: "Kabupaten Nunukan", pekerjaan: "Pengendali Teknis", jenis_pemeriksaan: "Kinerja JKN" }
      ],
      account_diklat: [
        { name: "Teknik Penentuan Area Kunci", jp: "20" },
        { name: "Persiapan Pemeriksaan LKPD TA 2024", jp: "56" },
        { name: "Self Learning Mandatory Integritas", jp: "10" }
      ]
    },
    {
      id: 69,
      account_name: "Syahri Ramadhani",
      account_jabatan: [{ name: "Pranata Komputer Pertama" }],
      account_pangkat: "Penata Muda (III/a)",
      account_golongan: "Golongan III",
      account_pendidikan: [{ jenjang: "S1", institusi: "Universitas Muhamaddiyah Malang", jurusan: "Teknik Informatika" }],
      keluarga: [
        { name: "Nadya Friska", hubungan: "Istri", domisili_sekarang: "Kota Tarakan" }
      ],
      pemeriksaan: [],
      account_diklat: []
    },
    {
      id: 70,
      account_name: "Ahmad Budi Santoso",
      account_jabatan: [{ name: "Pemeriksa Muda" }],
      account_pangkat: "Penata (III/c)",
      account_golongan: "Golongan III",
      account_pendidikan: [{ jenjang: "S1", institusi: "Universitas Indonesia", jurusan: "Akuntansi" }],
      keluarga: [
        { name: "Sari Indah", hubungan: "Istri", domisili_sekarang: "Jakarta" }
      ],
      pemeriksaan: [
        { entitas: "Provinsi Kalimantan Utara", pekerjaan: "Ketua Tim", jenis_pemeriksaan: "LKPD Interim TA 2024" },
        { entitas: "Provinsi Kalimantan Utara", pekerjaan: "Ketua Tim", jenis_pemeriksaan: "LKPD Terinci TA 2024" },
        { entitas: "Kabupaten Bulungan", pekerjaan: "Ketua Tim", jenis_pemeriksaan: "Kepatuhan" },
        { entitas: "Kabupaten Malinau", pekerjaan: "Ketua Tim", jenis_pemeriksaan: "Kinerja" },
        { entitas: "Kota Tarakan", pekerjaan: "Ketua Tim", jenis_pemeriksaan: "LKPD TA 2023" }
      ],
      account_diklat: [
        { name: "Kepemimpinan Tim Pemeriksaan", jp: "40" },
        { name: "Advanced Audit Techniques", jp: "32" }
      ]
    },
    {
      id: 71,
      account_name: "Dewi Sartika",
      account_jabatan: [{ name: "Pemeriksa Ahli Pertama" }],
      account_pangkat: "Pembina (IV/a)",
      account_golongan: "Golongan IV",
      account_pendidikan: [{ jenjang: "S2", institusi: "Universitas Gadjah Mada", jurusan: "Magister Akuntansi" }],
      keluarga: [
        { name: "Bambang Wijaya", hubungan: "Suami", domisili_sekarang: "Yogyakarta" }
      ],
      pemeriksaan: [
        { entitas: "Provinsi Kalimantan Utara", pekerjaan: "Pengendali Teknis", jenis_pemeriksaan: "LKPD TA 2024" },
        { entitas: "Kabupaten Malinau", pekerjaan: "Pengendali Teknis", jenis_pemeriksaan: "Kepatuhan DTT" },
        { entitas: "Kota Tarakan", pekerjaan: "Pengendali Teknis", jenis_pemeriksaan: "Kinerja" },
        { entitas: "Kabupaten Nunukan", pekerjaan: "Pengendali Teknis", jenis_pemeriksaan: "LKPD TA 2023" }
      ],
      account_diklat: [
        { name: "Pengendali Teknis Pemeriksaan", jp: "48" },
        { name: "Risk-Based Audit", jp: "36" },
        { name: "Quality Assurance", jp: "24" }
      ]
    },
    {
      id: 72,
      account_name: "Indira Kusuma",
      account_jabatan: [{ name: "Pemeriksa Muda" }],
      account_pangkat: "Penata (III/c)",
      account_golongan: "Golongan III",
      account_pendidikan: [{ jenjang: "S1", institusi: "Universitas Brawijaya", jurusan: "Manajemen" }],
      keluarga: [
        { name: "Andi Setiawan", hubungan: "Suami", domisili_sekarang: "Surabaya" }
      ],
      pemeriksaan: [
        { entitas: "Kabupaten Bulungan", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "LKPD TA 2024" },
        { entitas: "Kabupaten Bulungan", pekerjaan: "Ketua Tim", jenis_pemeriksaan: "Kepatuhan" },
        { entitas: "Kabupaten Tana Tidung", pekerjaan: "Anggota Tim", jenis_pemeriksaan: "Kinerja" }
      ],
      account_diklat: [
        { name: "Manajemen Tim Pemeriksaan", jp: "32" }
      ]
    }
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const stored = localStorage.getItem("accounts")
      const data = stored ? JSON.parse(stored) : sampleAccounts
      
      // Filter only accounts with "pemeriksa" in jabatan
      const filteredData = Array.isArray(data) ? data.filter(account => {
        const jabatan = account.account_jabatan?.[0]?.name?.toLowerCase() || ""
        return jabatan.includes("pemeriksa")
      }) : sampleAccounts.filter(account => {
        const jabatan = account.account_jabatan?.[0]?.name?.toLowerCase() || ""
        return jabatan.includes("pemeriksa")
      })
      
      setAccounts(filteredData)
      setLoading(false)
    }, 500)
  }, [])

  // Filter accounts based on current filters
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = account.account_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesJabatan = selectedJabatan === "all" || account.account_jabatan?.[0]?.name === selectedJabatan
      const matchesPangkat = selectedPangkat === "all" || account.account_pangkat === selectedPangkat
      
      // Updated jurusan filtering for multi-select
      const matchesJurusan = selectedJurusan.length === 0 || 
        selectedJurusan.some(jurusan => account.account_pendidikan?.[0]?.jurusan === jurusan)
      
      const matchesDomisili = selectedDomisili === "all" || 
        account.keluarga?.some(k => k.domisili_sekarang === selectedDomisili)
      
      return matchesSearch && matchesJabatan && matchesPangkat && matchesJurusan && matchesDomisili
    })
  }, [accounts, searchTerm, selectedJabatan, selectedPangkat, selectedJurusan, selectedDomisili])

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const jabatanOptions = [...new Set(accounts.map(a => a.account_jabatan?.[0]?.name).filter(Boolean))]
    const pangkatOptions = [...new Set(accounts.map(a => a.account_pangkat).filter(Boolean))]
    const jurusanOptions = [...new Set(accounts.map(a => a.account_pendidikan?.[0]?.jurusan).filter(j => j && j !== "0"))]
    const domisiliOptions = [...new Set(accounts.flatMap(a => 
      a.keluarga?.map(k => k.domisili_sekarang).filter(Boolean) || []
    ))]
    
    return { jabatanOptions, pangkatOptions, jurusanOptions, domisiliOptions }
  }, [accounts])

  // Update active filters
  useEffect(() => {
    const filters = []
    if (searchTerm) filters.push({ type: "search", value: searchTerm, label: `Pencarian: ${searchTerm}` })
    if (selectedJabatan !== "all") filters.push({ type: "jabatan", value: selectedJabatan, label: `Jabatan: ${selectedJabatan}` })
    if (selectedPangkat !== "all") filters.push({ type: "pangkat", value: selectedPangkat, label: `Pangkat: ${selectedPangkat}` })
    
    // Handle multiple jurusan filters
    selectedJurusan.forEach(jurusan => {
      filters.push({ type: "jurusan", value: jurusan, label: `Jurusan: ${jurusan}` })
    })
    
    if (selectedDomisili !== "all") filters.push({ type: "domisili", value: selectedDomisili, label: `Domisili: ${selectedDomisili}` })
    setActiveFilters(filters)
  }, [searchTerm, selectedJabatan, selectedPangkat, selectedJurusan, selectedDomisili])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedJabatan("all")
    setSelectedPangkat("all")
    setSelectedJurusan([]) // Clear array
    setSelectedDomisili("all")
  }

  // Toggle jurusan selection (improved for single toggle)
  const toggleJurusan = (jurusan) => {
    setSelectedJurusan(prev => 
      prev.includes(jurusan) 
        ? prev.filter(j => j !== jurusan)
        : [...prev, jurusan]
    )
  }

  // Toggle domisili selection
  const toggleDomisili = (domisili) => {
    setSelectedDomisili(prev => prev === domisili ? "all" : domisili)
  }

  // Remove specific jurusan filter
  const removeJurusanFilter = (jurusan) => {
    setSelectedJurusan(prev => prev.filter(j => j !== jurusan))
  }

  // Get Auditor Entity Matrix with role filtering
  const getAuditorEntityMatrix = (roleFilter = "all") => {
    const records = []
    
    // Flatten all pemeriksaan records with role filter
    filteredAccounts.forEach(account => {
      account.pemeriksaan?.forEach(p => {
        if (roleFilter === "all" || p.pekerjaan === roleFilter) {
          records.push({
            employee_name: account.account_name,
            entitas: p.entitas,
            jabatan: account.account_jabatan?.[0]?.name || "N/A",
            pekerjaan: p.pekerjaan
          })
        }
      })
    })

    if (records.length === 0) {
      return { auditors: [], entities: [], matrix: {} }
    }

    // Create matrix data
    const matrix = records.reduce((acc, record) => {
      const auditor = record.employee_name || "Unknown"
      const entity = record.entitas || "Unknown"
      
      if (!acc[auditor]) acc[auditor] = {}
      acc[auditor][entity] = (acc[auditor][entity] || 0) + 1
      
      return acc
    }, {})

    // Get top entities (columns) and auditors (rows)
    const entityCounts = records.reduce((acc, record) => {
      const entity = record.entitas || "Unknown"
      acc[entity] = (acc[entity] || 0) + 1
      return acc
    }, {})

    const auditorCounts = records.reduce((acc, record) => {
      const auditor = record.employee_name || "Unknown"
      acc[auditor] = (acc[auditor] || 0) + 1
      return acc
    }, {})

    const entities = Object.keys(entityCounts)
      .sort((a, b) => entityCounts[b] - entityCounts[a])
      .slice(0, 8) // Top 8 entities as columns

    const auditors = Object.keys(auditorCounts)
      .sort((a, b) => auditorCounts[b] - auditorCounts[a])
      .slice(0, 15) // Top 15 auditors as rows

    return { auditors, entities, matrix }
  }

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!filteredAccounts.length) return null

    const jabatanDistribution = filteredAccounts.reduce((acc, account) => {
      const jabatan = account.account_jabatan?.[0]?.name || "Tidak Diketahui"
      acc[jabatan] = (acc[jabatan] || 0) + 1
      return acc
    }, {})

    const pangkatDistribution = filteredAccounts.reduce((acc, account) => {
      const pangkat = account.account_pangkat || "Tidak Diketahui"
      acc[pangkat] = (acc[pangkat] || 0) + 1
      return acc
    }, {})

    const jurusanDistribution = filteredAccounts.reduce((acc, account) => {
      const jurusan = account.account_pendidikan?.[0]?.jurusan || "Tidak Diketahui"
      if (jurusan !== "0") {
        acc[jurusan] = (acc[jurusan] || 0) + 1
      }
      return acc
    }, {})

    const domisiliAnalysis = filteredAccounts.reduce((acc, account) => {
      const domisili = account.keluarga?.find(k => k.domisili_sekarang)?.domisili_sekarang || "Tidak Diketahui"
      acc[domisili] = (acc[domisili] || 0) + 1
      return acc
    }, {})

    const roleDistribution = {}
    filteredAccounts.forEach(account => {
      account.pemeriksaan?.forEach(p => {
        roleDistribution[p.pekerjaan] = (roleDistribution[p.pekerjaan] || 0) + 1
      })
    })

    const trainingStats = filteredAccounts.reduce((acc, account) => {
      const trainingCount = account.account_diklat?.length || 0
      acc.totalTraining += trainingCount
      acc.trainedPersonnel += trainingCount > 0 ? 1 : 0
      return acc
    }, { totalTraining: 0, trainedPersonnel: 0 })

    return {
      jabatanDistribution,
      pangkatDistribution,
      jurusanDistribution,
      domisiliAnalysis,
      roleDistribution,
      trainingStats,
      totalPersonnel: filteredAccounts.length
    }
  }, [filteredAccounts])

  // Handle chart clicks for filtering with toggle functionality
  const handleChartClick = (data, type) => {
    if (type === 'jabatan') {
      setSelectedJabatan(prev => prev === data.name ? "all" : data.name)
    } else if (type === 'pangkat') {
      setSelectedPangkat(prev => prev === data.name ? "all" : data.name)
    }
  }

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Insights Pembentukan Tim Pemeriksaan
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Analisis komprehensif komposisi dan kapabilitas tim pemeriksa berdasarkan jabatan, pendidikan, domisili, dan pengalaman
          </p>
        </div>

        {/* Filters Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Filter className="h-5 w-5 text-blue-600" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Clear */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama pemeriksa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={clearFilters} 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedJabatan} onValueChange={setSelectedJabatan}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jabatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jabatan</SelectItem>
                  {filterOptions.jabatanOptions.map(jabatan => (
                    <SelectItem key={jabatan} value={jabatan}>{jabatan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPangkat} onValueChange={setSelectedPangkat}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Pangkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pangkat</SelectItem>
                  {filterOptions.pangkatOptions.map(pangkat => (
                    <SelectItem key={pangkat} value={pangkat}>{pangkat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Multi-select Jurusan */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-700">
                    Jurusan ({selectedJurusan.length} dipilih)
                  </div>
                  {selectedJurusan.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => setSelectedJurusan([])}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                
                {/* Quick filter buttons for Teknik & Akuntansi */}
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                    onClick={() => {
                      const teknikJurusan = filterOptions.jurusanOptions.filter(j => 
                        j.toLowerCase().includes('teknik')
                      )
                      setSelectedJurusan(prev => {
                        const combined = [...new Set([...prev, ...teknikJurusan])]
                        return combined
                      })
                    }}
                  >
                    + Semua Teknik
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    onClick={() => {
                      const akuntansiJurusan = filterOptions.jurusanOptions.filter(j => 
                        j.toLowerCase().includes('akuntansi')
                      )
                      setSelectedJurusan(prev => {
                        const combined = [...new Set([...prev, ...akuntansiJurusan])]
                        return combined
                      })
                    }}
                  >
                    + Semua Akuntansi
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-md bg-gray-50">
                  {filterOptions.jurusanOptions.length === 0 ? (
                    <span className="text-xs text-gray-500 p-1">Tidak ada data jurusan</span>
                  ) : (
                    filterOptions.jurusanOptions.map(jurusan => (
                      <Button
                        key={jurusan}
                        variant={selectedJurusan.includes(jurusan) ? "default" : "outline"}
                        size="sm"
                        className={`text-xs h-7 ${
                          selectedJurusan.includes(jurusan) 
                            ? "bg-blue-500 text-white hover:bg-blue-600" 
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleJurusan(jurusan)}
                      >
                        {jurusan}
                        {selectedJurusan.includes(jurusan) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500">Klik untuk memilih/membatalkan multiple jurusan atau gunakan tombol quick filter</p>
              </div>

              <Select value={selectedDomisili} onValueChange={setSelectedDomisili}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Domisili" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Domisili</SelectItem>
                  {filterOptions.domisiliOptions.map(domisili => (
                    <SelectItem key={domisili} value={domisili}>{domisili}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-sm font-medium text-gray-600">Filter Aktif:</span>
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {filter.label}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => {
                        if (filter.type === 'search') setSearchTerm("")
                        else if (filter.type === 'jabatan') setSelectedJabatan("all")
                        else if (filter.type === 'pangkat') setSelectedPangkat("all")
                        else if (filter.type === 'jurusan') removeJurusanFilter(filter.value)
                        else if (filter.type === 'domisili') setSelectedDomisili("all")
                      }}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Pemeriksa</p>
                  <p className="text-3xl font-bold">{analytics?.totalPersonnel || 0}</p>
                  <p className="text-blue-100 text-xs mt-1">dari {accounts.length} total</p>
                </div>
                <Users className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Pemeriksa Pertama</p>
                  <p className="text-3xl font-bold">
                    {analytics ? (analytics.jabatanDistribution["Pemeriksa Pertama"] || 0) : 0}
                  </p>
                  <p className="text-green-100 text-xs mt-1">level junior</p>
                </div>
                <Award className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Pemeriksa Muda</p>
                  <p className="text-3xl font-bold">
                    {analytics ? (analytics.jabatanDistribution["Pemeriksa Muda"] || 0) : 0}
                  </p>
                  <p className="text-purple-100 text-xs mt-1">level senior</p>
                </div>
                <Star className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Sudah Terlatih</p>
                  <p className="text-3xl font-bold">{analytics?.trainingStats.trainedPersonnel || 0}</p>
                  <p className="text-orange-100 text-xs mt-1">mengikuti diklat</p>
                </div>
                <BookOpen className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-5 w-5 text-blue-600" />
                Distribusi Jabatan Pemeriksa
              </CardTitle>
              <CardDescription>
                Klik pada segmen untuk filter berdasarkan jabatan (klik 2x untuk batalkan)
                {selectedJabatan !== "all" && (
                  <span className="ml-2 text-blue-600 font-medium">• Filter: {selectedJabatan}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics?.jabatanDistribution || {}).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) => handleChartClick(data, 'jabatan')}
                    className="cursor-pointer"
                  >
                    {Object.entries(analytics?.jabatanDistribution || {}).map(([name, value], index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedJabatan === name ? '#1d4ed8' : COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity duration-200"
                        stroke={selectedJabatan === name ? '#1e40af' : 'none'}
                        strokeWidth={selectedJabatan === name ? 3 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5 text-green-600" />
                Distribusi Peran dalam Tim
              </CardTitle>
              <CardDescription>
                Klik pada bar untuk melihat detail peran (interaktif)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analytics?.roleDistribution || {}).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => handleChartClick(data, 'role')}
                    className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Matriks Pengalaman per Entitas dengan Tabs */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building className="h-5 w-5 text-purple-600" />
              Matriks Pengalaman Pemeriksaan per Entitas
            </CardTitle>
            <CardDescription>
              Matrix pengalaman setiap pemeriksa pada berbagai entitas berdasarkan peran dalam tim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={matrixTab} onValueChange={setMatrixTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Semua Peran
                </TabsTrigger>
                <TabsTrigger value="Ketua Tim" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Ketua Tim
                </TabsTrigger>
                <TabsTrigger value="Anggota Tim" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Anggota Tim
                </TabsTrigger>
                <TabsTrigger value="Pengendali Teknis" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pengendali Teknis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {(() => {
                  const matrixData = getAuditorEntityMatrix("all")
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white">
                      <ScrollArea className="h-96">
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-max">
                          <Table>
                          <TableHeader>
                                <TableRow className="bg-gray-50">
                                <TableHead className="sticky top-0 left-0 bg-gray-50 border-r font-bold min-w-[180px] z-20">
                                    Nama Pemeriksa
                                </TableHead>
                                {/* <TableHead className="sticky top-0 left-[180px] bg-gray-50 border-r font-bold min-w-[130px] z-20">
                                    Jabatan
                                </TableHead> */}
                              {matrixData.entities?.map((entity) => (
                                <TableHead
                                    key={entity}
                                    className="sticky top-0 text-center min-w-[140px] font-bold bg-gray-50 px-3 z-10"
                                >
                                    <div className="text-xs leading-tight py-2">
                                    {entity
                                        .replace(/Provinsi/gi, "Prov")
                                        .replace(/Kabupaten/gi, "Kab")}
                                    </div>
                                </TableHead>
                                ))}
                                <TableHead className="sticky top-0 text-center font-bold bg-blue-100 min-w-[80px] z-10">
                                    Total
                                </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                              {matrixData.auditors?.map((auditor) => {
                                const totalAudits = Object.values(matrixData.matrix[auditor] || {}).reduce((sum, count) => sum + count, 0)
                                const account = filteredAccounts.find(a => a.account_name === auditor)
                                const jabatan = account?.account_jabatan?.[0]?.name || "N/A"
                                
                                return (
                                  <TableRow key={auditor} className="hover:bg-blue-50/50 transition-colors duration-150">
                                    <TableCell className="sticky left-0 bg-white border-r font-medium z-10">
                                      {auditor}
                                    </TableCell>
                                    {/* <TableCell className="sticky left-[180px] bg-white border-r z-10">
                                      <Badge variant="outline" className="text-xs">
                                        {jabatan}
                                      </Badge>
                                    </TableCell> */}
                                    {matrixData.entities.map((entity) => {
                                      const count = matrixData.matrix[auditor]?.[entity] || 0
                                      return (
                                        <TableCell key={entity} className="text-center">
                                          {count > 0 ? (
                                            <Badge 
                                              variant="outline"
                                              className={`text-xs font-semibold ${
                                                count >= 5 ? "bg-green-500 text-white border-green-500" :
                                                count >= 3 ? "bg-blue-500 text-white border-blue-500" :
                                                count >= 1 ? "bg-yellow-500 text-white border-yellow-500" : ""
                                              }`}
                                            >
                                              {count}
                                            </Badge>
                                          ) : (
                                            <span className="text-gray-300 font-medium">•</span>
                                          )}
                                        </TableCell>
                                      )
                                    })}
                                    <TableCell className="text-center bg-blue-50 font-bold">
                                      <Badge variant="outline" className="bg-blue-200 text-blue-800 font-semibold">
                                        {totalAudits}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                        </div>
                      </ScrollArea>
                      
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-gray-800">Tingkat Pengalaman:</h4>
                            <div className="flex flex-wrap gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-500 text-white border-green-500">5+</Badge>
                                <span className="text-gray-700">Sangat Berpengalaman</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-500 text-white border-blue-500">3-4</Badge>
                                <span className="text-gray-700">Berpengalaman</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-500 text-white border-yellow-500">1-2</Badge>
                                <span className="text-gray-700">Cukup Pengalaman</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300 font-medium">•</span>
                                <span className="text-gray-700">Belum Ada Pengalaman</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">
                              Menampilkan {matrixData.auditors?.length || 0} pemeriksa teratas
                            </p>
                            <p className="text-xs text-gray-500">
                              dari {matrixData.entities?.length || 0} entitas tersering
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </TabsContent>

              <TabsContent value="Ketua Tim">
                {(() => {
                  const matrixData = getAuditorEntityMatrix("Ketua Tim")
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white">
                      <ScrollArea className="h-96">
                        <div className="min-w-max">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-yellow-50">
                                <TableHead className="sticky left-0 bg-yellow-50 border-r font-bold min-w-[180px] z-10">
                                  Nama Pemeriksa
                                </TableHead>
                                <TableHead className="sticky left-[180px] bg-yellow-50 border-r font-bold min-w-[130px] z-10">
                                  Jabatan
                                </TableHead>
                                {matrixData.entities?.map((entity) => (
                                  <TableHead key={entity} className="text-center min-w-[140px] font-bold bg-yellow-50 px-3">
                                    <div className="text-xs leading-tight py-2">
                                      {entity}
                                    </div>
                                  </TableHead>
                                ))}
                                <TableHead className="text-center font-bold bg-yellow-100 min-w-[80px]">
                                  Total
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {matrixData.auditors?.map((auditor) => {
                                const totalAudits = Object.values(matrixData.matrix[auditor] || {}).reduce((sum, count) => sum + count, 0)
                                const account = filteredAccounts.find(a => a.account_name === auditor)
                                const jabatan = account?.account_jabatan?.[0]?.name || "N/A"
                                
                                return (
                                  <TableRow key={auditor} className="hover:bg-yellow-50/50 transition-colors duration-150">
                                    <TableCell className="sticky left-0 bg-white border-r font-medium z-10">
                                      {auditor}
                                    </TableCell>
                                    <TableCell className="sticky left-[180px] bg-white border-r z-10">
                                      <Badge variant="outline" className="text-xs">
                                        {jabatan}
                                      </Badge>
                                    </TableCell>
                                    {matrixData.entities.map((entity) => {
                                      const count = matrixData.matrix[auditor]?.[entity] || 0
                                      return (
                                        <TableCell key={entity} className="text-center">
                                          {count > 0 ? (
                                            <Badge className="text-xs font-semibold bg-yellow-500 text-white border-yellow-500">
                                              {count}
                                            </Badge>
                                          ) : (
                                            <span className="text-gray-300 font-medium">•</span>
                                          )}
                                        </TableCell>
                                      )
                                    })}
                                    <TableCell className="text-center bg-yellow-50 font-bold">
                                      <Badge variant="outline" className="bg-yellow-200 text-yellow-800 font-semibold">
                                        {totalAudits}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </ScrollArea>
                      
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-t">
                        <p className="text-sm text-gray-600 text-center">
                          <strong>Pengalaman sebagai Ketua Tim:</strong> Menampilkan {matrixData.auditors?.length || 0} pemeriksa 
                          yang pernah memimpin tim di {matrixData.entities?.length || 0} entitas
                        </p>
                      </div>
                    </div>
                  )
                })()}
              </TabsContent>

              <TabsContent value="Anggota Tim">
                {(() => {
                  const matrixData = getAuditorEntityMatrix("Anggota Tim")
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white">
                      <ScrollArea className="h-96">
                        <div className="min-w-max">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-blue-50">
                                <TableHead className="sticky left-0 bg-blue-50 border-r font-bold min-w-[180px] z-10">
                                  Nama Pemeriksa
                                </TableHead>
                                <TableHead className="sticky left-[180px] bg-blue-50 border-r font-bold min-w-[130px] z-10">
                                  Jabatan
                                </TableHead>
                                {matrixData.entities?.map((entity) => (
                                  <TableHead key={entity} className="text-center min-w-[140px] font-bold bg-blue-50 px-3">
                                    <div className="text-xs leading-tight py-2">
                                      {entity}
                                    </div>
                                  </TableHead>
                                ))}
                                <TableHead className="text-center font-bold bg-blue-100 min-w-[80px]">
                                  Total
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {matrixData.auditors?.map((auditor) => {
                                const totalAudits = Object.values(matrixData.matrix[auditor] || {}).reduce((sum, count) => sum + count, 0)
                                const account = filteredAccounts.find(a => a.account_name === auditor)
                                const jabatan = account?.account_jabatan?.[0]?.name || "N/A"
                                
                                return (
                                  <TableRow key={auditor} className="hover:bg-blue-50/50 transition-colors duration-150">
                                    <TableCell className="sticky left-0 bg-white border-r font-medium z-10">
                                      {auditor}
                                    </TableCell>
                                    <TableCell className="sticky left-[180px] bg-white border-r z-10">
                                      <Badge variant="outline" className="text-xs">
                                        {jabatan}
                                      </Badge>
                                    </TableCell>
                                    {matrixData.entities.map((entity) => {
                                      const count = matrixData.matrix[auditor]?.[entity] || 0
                                      return (
                                        <TableCell key={entity} className="text-center">
                                          {count > 0 ? (
                                            <Badge className="text-xs font-semibold bg-blue-500 text-white border-blue-500">
                                              {count}
                                            </Badge>
                                          ) : (
                                            <span className="text-gray-300 font-medium">•</span>
                                          )}
                                        </TableCell>
                                      )
                                    })}
                                    <TableCell className="text-center bg-blue-50 font-bold">
                                      <Badge variant="outline" className="bg-blue-200 text-blue-800 font-semibold">
                                        {totalAudits}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </ScrollArea>
                      
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-t">
                        <p className="text-sm text-gray-600 text-center">
                          <strong>Pengalaman sebagai Anggota Tim:</strong> Menampilkan {matrixData.auditors?.length || 0} pemeriksa 
                          yang pernah menjadi anggota di {matrixData.entities?.length || 0} entitas
                        </p>
                      </div>
                    </div>
                  )
                })()}
              </TabsContent>

              <TabsContent value="Pengendali Teknis">
                {(() => {
                  const matrixData = getAuditorEntityMatrix("Pengendali Teknis")
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white">
                      <ScrollArea className="h-96">
                        <div className="min-w-max">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-purple-50">
                                <TableHead className="sticky left-0 bg-purple-50 border-r font-bold min-w-[180px] z-10">
                                  Nama Pemeriksa
                                </TableHead>
                                <TableHead className="sticky left-[180px] bg-purple-50 border-r font-bold min-w-[130px] z-10">
                                  Jabatan
                                </TableHead>
                                {matrixData.entities?.map((entity) => (
                                  <TableHead key={entity} className="text-center min-w-[140px] font-bold bg-purple-50 px-3">
                                    <div className="text-xs leading-tight py-2">
                                      {entity}
                                    </div>
                                  </TableHead>
                                ))}
                                <TableHead className="text-center font-bold bg-purple-100 min-w-[80px]">
                                  Total
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {matrixData.auditors?.map((auditor) => {
                                const totalAudits = Object.values(matrixData.matrix[auditor] || {}).reduce((sum, count) => sum + count, 0)
                                const account = filteredAccounts.find(a => a.account_name === auditor)
                                const jabatan = account?.account_jabatan?.[0]?.name || "N/A"
                                
                                return (
                                  <TableRow key={auditor} className="hover:bg-purple-50/50 transition-colors duration-150">
                                    <TableCell className="sticky left-0 bg-white border-r font-medium z-10">
                                      {auditor}
                                    </TableCell>
                                    <TableCell className="sticky left-[180px] bg-white border-r z-10">
                                      <Badge variant="outline" className="text-xs">
                                        {jabatan}
                                      </Badge>
                                    </TableCell>
                                    {matrixData.entities.map((entity) => {
                                      const count = matrixData.matrix[auditor]?.[entity] || 0
                                      return (
                                        <TableCell key={entity} className="text-center">
                                          {count > 0 ? (
                                            <Badge className="text-xs font-semibold bg-purple-500 text-white border-purple-500">
                                              {count}
                                            </Badge>
                                          ) : (
                                            <span className="text-gray-300 font-medium">•</span>
                                          )}
                                        </TableCell>
                                      )
                                    })}
                                    <TableCell className="text-center bg-purple-50 font-bold">
                                      <Badge variant="outline" className="bg-purple-200 text-purple-800 font-semibold">
                                        {totalAudits}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </ScrollArea>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border-t">
                        <p className="text-sm text-gray-600 text-center">
                          <strong>Pengalaman sebagai Pengendali Teknis:</strong> Menampilkan {matrixData.auditors?.length || 0} pemeriksa 
                          yang pernah menjadi pengendali di {matrixData.entities?.length || 0} entitas
                        </p>
                      </div>
                    </div>
                  )
                })()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tabel Detail Komposisi Tim */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-indigo-600" />
              Detail Komposisi Tim Pemeriksa
            </CardTitle>
            <CardDescription>
              Informasi lengkap setiap anggota tim (menampilkan {filteredAccounts.length} dari {accounts.length} pemeriksa)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 bg-white">
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-bold">Nama</TableHead>
                      <TableHead className="font-bold">Jabatan</TableHead>
                      <TableHead className="font-bold">Pangkat</TableHead>
                      <TableHead className="font-bold">Pendidikan</TableHead>
                      <TableHead className="font-bold">Jurusan</TableHead>
                      <TableHead className="font-bold">Domisili Keluarga</TableHead>
                      <TableHead className="font-bold text-center">Pemeriksaan</TableHead>
                      <TableHead className="font-bold text-center">Pelatihan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                        <TableCell className="font-medium text-gray-900">{account.account_name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${
                              account.account_jabatan?.[0]?.name?.includes("Ahli") ? "border-purple-500 text-purple-700 bg-purple-50" :
                              account.account_jabatan?.[0]?.name?.includes("Muda") ? "border-blue-500 text-blue-700 bg-blue-50" :
                              "border-green-500 text-green-700 bg-green-50"
                            }`}
                          >
                            {account.account_jabatan?.[0]?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{account.account_pangkat}</TableCell>
                        <TableCell className="text-sm">
                          {account.account_pendidikan?.[0] ? 
                            `${account.account_pendidikan[0].jenjang} - ${account.account_pendidikan[0].institusi}` : 
                            "N/A"
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={account.account_pendidikan?.[0]?.jurusan && account.account_pendidikan[0].jurusan !== "0" ? "default" : "secondary"}>
                            {account.account_pendidikan?.[0]?.jurusan && account.account_pendidikan[0].jurusan !== "0" ? 
                              account.account_pendidikan[0].jurusan : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {account.keluarga?.find(k => k.domisili_sekarang)?.domisili_sekarang || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`font-semibold ${
                              (account.pemeriksaan?.length || 0) >= 5 ? "bg-green-100 text-green-800 border-green-300" :
                              (account.pemeriksaan?.length || 0) >= 3 ? "bg-blue-100 text-blue-800 border-blue-300" :
                              "bg-yellow-100 text-yellow-800 border-yellow-300"
                            }`}
                          >
                            {account.pemeriksaan?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`font-semibold ${
                              (account.account_diklat?.length || 0) >= 3 ? "bg-purple-100 text-purple-800 border-purple-300" :
                              (account.account_diklat?.length || 0) >= 1 ? "bg-orange-100 text-orange-800 border-orange-300" :
                              "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                          >
                            {account.account_diklat?.length || 0}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Analisis Pendidikan dan Geografis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                Distribusi Jurusan Pendidikan
              </CardTitle>
              <CardDescription>
                Latar belakang pendidikan tim pemeriksa (hasil filter) - {Object.keys(analytics?.jurusanDistribution || {}).length} jurusan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3 pr-4">
                  {Object.entries(analytics?.jurusanDistribution || {}).map(([jurusan, jumlah]) => (
                    <div 
                      key={jurusan} 
                      className={`flex items-center justify-between p-4 bg-gradient-to-r rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer ${
                        selectedJurusan.includes(jurusan) 
                          ? 'from-emerald-100 to-green-100 border-emerald-300 ring-2 ring-emerald-200' 
                          : 'from-emerald-50 to-green-50 border-emerald-200'
                      }`}
                      onClick={() => toggleJurusan(jurusan)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedJurusan.includes(jurusan) ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}></div>
                        <span className={`font-medium ${
                          selectedJurusan.includes(jurusan) ? 'text-emerald-800' : 'text-gray-800'
                        }`}>
                          {jurusan}
                          {selectedJurusan.includes(jurusan) && (
                            <span className="ml-2 text-xs text-emerald-600">✓ Dipilih</span>
                          )}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold">
                        {jumlah} orang
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5 text-rose-600" />
                Distribusi Domisili Keluarga
              </CardTitle>
              <CardDescription>
                Sebaran geografis keluarga pemeriksa (hasil filter) - {Object.keys(analytics?.domisiliAnalysis || {}).length} lokasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3 pr-4">
                  {Object.entries(analytics?.domisiliAnalysis || {}).map(([domisili, jumlah]) => (
                    <div 
                      key={domisili} 
                      className={`flex items-center justify-between p-4 bg-gradient-to-r rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer ${
                        selectedDomisili === domisili 
                          ? 'from-rose-100 to-pink-100 border-rose-300 ring-2 ring-rose-200' 
                          : 'from-rose-50 to-pink-50 border-rose-200'
                      }`}
                      onClick={() => toggleDomisili(domisili)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedDomisili === domisili ? 'bg-rose-600' : 'bg-rose-500'
                        }`}></div>
                        <span className={`font-medium ${
                          selectedDomisili === domisili ? 'text-rose-800' : 'text-gray-800'
                        }`}>
                          {domisili}
                          {selectedDomisili === domisili && (
                            <span className="ml-2 text-xs text-rose-600">✓ Dipilih</span>
                          )}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-300 font-semibold">
                        {jumlah} keluarga
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Rekapitulasi Peran per Pegawai */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-5 w-5 text-cyan-600" />
              Rekapitulasi Peran dalam Pemeriksaan
            </CardTitle>
            <CardDescription>
              Statistik detail peran yang pernah dijalankan setiap pemeriksa (hasil filter: {filteredAccounts.length} pemeriksa)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 bg-white">
              <ScrollArea className="h-80">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-bold">Nama</TableHead>
                      <TableHead className="font-bold">Jabatan</TableHead>
                      <TableHead className="font-bold text-center">Ketua Tim</TableHead>
                      <TableHead className="font-bold text-center">Anggota Tim</TableHead>
                      <TableHead className="font-bold text-center">Pengendali Teknis</TableHead>
                      <TableHead className="font-bold text-center bg-blue-100">Total</TableHead>
                      <TableHead className="font-bold text-center">Pengalaman</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => {
                      const ketuaCount = account.pemeriksaan?.filter(p => p.pekerjaan === "Ketua Tim").length || 0
                      const anggotaCount = account.pemeriksaan?.filter(p => p.pekerjaan === "Anggota Tim").length || 0
                      const pengendaliCount = account.pemeriksaan?.filter(p => p.pekerjaan === "Pengendali Teknis").length || 0
                      const totalCount = account.pemeriksaan?.length || 0
                      
                      return (
                        <TableRow key={account.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                          <TableCell className="font-medium text-gray-900">{account.account_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {account.account_jabatan?.[0]?.name || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={ketuaCount > 0 ? "default" : "secondary"}
                              className={`font-semibold ${ketuaCount > 0 ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-600"}`}
                            >
                              {ketuaCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={anggotaCount > 0 ? "default" : "secondary"}
                              className={`font-semibold ${anggotaCount > 0 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}
                            >
                              {anggotaCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={pengendaliCount > 0 ? "default" : "secondary"}
                              className={`font-semibold ${pengendaliCount > 0 ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-600"}`}
                            >
                              {pengendaliCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center bg-blue-50">
                            <Badge variant="outline" className="bg-blue-200 text-blue-800 font-bold">
                              {totalCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={
                              totalCount >= 7 ? "default" :
                              totalCount >= 4 ? "secondary" : "outline"
                            } className={
                              totalCount >= 7 ? "bg-green-600 text-white" :
                              totalCount >= 4 ? "bg-blue-500 text-white" :
                              "bg-yellow-200 text-yellow-800"
                            }>
                              {totalCount >= 7 ? "Senior" :
                               totalCount >= 4 ? "Berpengalaman" : "Junior"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Analisis Kapabilitas Tim */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Analisis Kapabilitas dan Kesiapan Tim
            </CardTitle>
            <CardDescription>
              Evaluasi kesiapan tim berdasarkan pengalaman, pelatihan, dan kompetensi (hasil filter)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border-2 border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-green-800 text-lg">Siap Memimpin Tim</h4>
                </div>
                <p className="text-sm text-green-700 mb-4 leading-relaxed">
                  Pemeriksa dengan pengalaman sebagai Ketua Tim atau Pengendali Teknis ({filteredAccounts.filter(account => {
                    const ketuaCount = account.pemeriksaan?.filter(p => p.pekerjaan === "Ketua Tim").length || 0
                    const pengendaliCount = account.pemeriksaan?.filter(p => p.pekerjaan === "Pengendali Teknis").length || 0
                    return ketuaCount > 0 || pengendaliCount > 0
                  }).length} orang)
                </p>
                <ScrollArea className="h-48">
                  <div className="space-y-3 pr-4">
                    {filteredAccounts
                      .filter(account => {
                        const ketuaCount = account.pemeriksaan?.filter(p => p.pekerjaan === "Ketua Tim").length || 0
                        const pengendaliCount = account.pemeriksaan?.filter(p => p.pekerjaan === "Pengendali Teknis").length || 0
                        return ketuaCount > 0 || pengendaliCount > 0
                      })
                      .sort((a, b) => a.account_name.localeCompare(b.account_name))
                      .map(account => (
                        <div key={account.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-shadow duration-200">
                          <span className="font-medium text-gray-900">{account.account_name}</span>
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                            {account.account_jabatan?.[0]?.name}
                          </Badge>
                        </div>
                      ))}
                    {filteredAccounts.filter(account => {
                      const ketuaCount = account.pemeriksaan?.filter(p => p.pekerjaan === "Ketua Tim").length || 0
                      const pengendaliCount = account.pemeriksaan?.filter(p => p.pekerjaan === "Pengendali Teknis").length || 0
                      return ketuaCount > 0 || pengendaliCount > 0
                    }).length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Belum ada pemeriksa dengan pengalaman memimpin tim
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="p-6 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-blue-800 text-lg">Tim Berpengalaman</h4>
                </div>
                <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                  Pemeriksa dengan pengalaman pemeriksaan 5+ kali ({filteredAccounts.filter(account => (account.pemeriksaan?.length || 0) >= 5).length} orang)
                </p>
                <ScrollArea className="h-48">
                  <div className="space-y-3 pr-4">
                    {filteredAccounts
                      .filter(account => (account.pemeriksaan?.length || 0) >= 5)
                      .sort((a, b) => (b.pemeriksaan?.length || 0) - (a.pemeriksaan?.length || 0))
                      .map(account => (
                        <div key={account.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow duration-200">
                          <span className="font-medium text-gray-900">{account.account_name}</span>
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                            {account.pemeriksaan?.length} kali
                          </Badge>
                        </div>
                      ))}
                    {filteredAccounts.filter(account => (account.pemeriksaan?.length || 0) >= 5).length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Belum ada pemeriksa dengan pengalaman 5+ pemeriksaan
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="p-6 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-purple-800 text-lg">Spesialis Teknis</h4>
                </div>
                <p className="text-sm text-purple-700 mb-4 leading-relaxed">
                  Pemeriksa dengan latar belakang Teknik dan Akuntansi ({filteredAccounts.filter(account => {
                    const jurusan = account.account_pendidikan?.[0]?.jurusan?.toLowerCase() || ""
                    return jurusan && jurusan !== "0" && 
                           (jurusan.includes("teknik") || jurusan.includes("akuntansi"))
                  }).length} orang)
                </p>
                <ScrollArea className="h-48">
                  <div className="space-y-3 pr-4">
                    {filteredAccounts
                      .filter(account => {
                        const jurusan = account.account_pendidikan?.[0]?.jurusan?.toLowerCase() || ""
                        return jurusan && jurusan !== "0" && 
                               (jurusan.includes("teknik") || jurusan.includes("akuntansi"))
                      })
                      .sort((a, b) => {
                        // Sort by jurusan first, then by name
                        const jurusanA = a.account_pendidikan?.[0]?.jurusan || ""
                        const jurusanB = b.account_pendidikan?.[0]?.jurusan || ""
                        if (jurusanA === jurusanB) {
                          return a.account_name.localeCompare(b.account_name)
                        }
                        return jurusanA.localeCompare(jurusanB)
                      })
                      .map(account => (
                        <div key={account.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition-shadow duration-200">
                          <span className="font-medium text-gray-900">{account.account_name}</span>
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-300">
                            {account.account_pendidikan?.[0]?.jurusan}
                          </Badge>
                        </div>
                      ))}
                    {filteredAccounts.filter(account => {
                      const jurusan = account.account_pendidikan?.[0]?.jurusan?.toLowerCase() || ""
                      return jurusan && jurusan !== "0" && 
                             (jurusan.includes("teknik") || jurusan.includes("akuntansi"))
                    }).length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Tidak ada pemeriksa dengan latar belakang Teknik atau Akuntansi
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rekomendasi Pembentukan Tim */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Rekomendasi Pembentukan Tim
            </CardTitle>
            <CardDescription>
              Saran strategis berdasarkan analisis data kompetensi dan pengalaman tim saat ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6" />
                  <h4 className="font-bold text-lg">Kekuatan Tim</h4>
                </div>
                <ul className="space-y-2 text-green-50">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-200 rounded-full mt-2 flex-shrink-0"></div>
                    Tersedia {Object.keys(analytics?.roleDistribution || {}).length} pemeriksa dengan pengalaman berbagai peran
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-200 rounded-full mt-2 flex-shrink-0"></div>
                    {analytics?.trainingStats.trainedPersonnel || 0} pemeriksa telah mengikuti pelatihan formal
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-200 rounded-full mt-2 flex-shrink-0"></div>
                    Diversitas latar belakang pendidikan mendukung berbagai jenis pemeriksaan
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6" />
                  <h4 className="font-bold text-lg">Area Pengembangan</h4>
                </div>
                <ul className="space-y-2 text-yellow-50">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-200 rounded-full mt-2 flex-shrink-0"></div>
                    Perlu menambah pemeriksa dengan pengalaman sebagai Ketua Tim untuk diversifikasi kepemimpinan
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-200 rounded-full mt-2 flex-shrink-0"></div>
                    Pelatihan lanjutan diperlukan untuk meningkatkan kompetensi teknis spesifik
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-200 rounded-full mt-2 flex-shrink-0"></div>
                    Distribusi geografis keluarga perlu dipertimbangkan dalam efisiensi penugasan
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6" />
                  <h4 className="font-bold text-lg">Strategi Optimalisasi</h4>
                </div>
                <ul className="space-y-2 text-blue-50">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0"></div>
                    Implementasi sistem rotasi peran untuk memberikan kesempatan memimpin tim kepada junior
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0"></div>
                    Program mentoring terstruktur dari pemeriksa senior kepada junior
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0"></div>
                    Pemanfaatan optimal keahlian khusus sesuai latar belakang pendidikan
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0"></div>
                    Pertimbangan faktor geografis dan keluarga dalam pembagian tim untuk efisiensi operasional
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Stats */}
        <div className="text-center p-6 bg-gradient-to-r from-gray-100 to-blue-100 rounded-xl">
          <p className="text-gray-600 text-sm">
            Data dianalisis dari <strong>{accounts.length}</strong> total pemeriksa 
            • Filter aktif: <strong>{activeFilters.length}</strong> 
            • Menampilkan: <strong>{filteredAccounts.length}</strong> pemeriksa
          </p>
        </div>
      </div>
    </div>
  )
}