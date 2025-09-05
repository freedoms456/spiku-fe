"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ActiveFilters from "./ActiveFilters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Award, Calendar, BarChart3, Activity, Target } from "lucide-react"
// import { accounts } from "@/lib/employee-management-data"
import dynamic from "next/dynamic"

interface AccountsAnalyticsProps {
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function AnalitikAkun({
  filteredAccounts: propFilteredAccounts,
  onFilterChange,
}: AccountsAnalyticsProps = {}) {
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [selectedAge, setSelectedAge] = useState<string | null>(null)
  const accounts = {}

  // Menghitung umur dari tanggal lahir dengan error handling
  const calculateAge = (birthDate: string): number => {
    try {
      // Validasi input kosong atau null
      if (!birthDate || typeof birthDate !== 'string') {
        return 100;
      }

      const today = new Date();
      
      // birthDate format: "DD/MM/YYYY"
      const dateParts = birthDate.split("/");
      
      // Validasi format tanggal (harus ada 3 bagian)
      if (dateParts.length !== 3) {
        return 100;
      }
      
      const [day, month, year] = dateParts.map(Number);
      
      // Validasi angka valid
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return 100;
      }
      
      // Validasi rentang tanggal yang masuk akal
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > today.getFullYear()) {
        return 100;
      }
      
      // bulan dikurangi 1 karena index dimulai 0
      const birth = new Date(year, month - 1, day);
      
      // Validasi tanggal yang dibuat valid
      if (isNaN(birth.getTime())) {
        return 100;
      }
      
      // Validasi tanggal lahir tidak di masa depan
      if (birth > today) {
        return 100;
      }
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      // Validasi umur dalam rentang yang masuk akal
      if (age < 0 || age > 150) {
        return 100;
      }
      
      return age;
    } catch (error) {
      // Jika ada error apapun, return 100
      console.warn('Error calculating age:', error);
      return 100;
    }
  };
  
  let filtered = accounts

  // Mendapatkan akun yang telah difilter berdasarkan pilihan
  const getFilteredAccounts = () => {
    // console.log(selectedAge)
    if (propFilteredAccounts) {
      return propFilteredAccounts
    }

    return filtered
  }

  // Grafik Distribusi Jenis Kelamin
  const getGenderDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const genderCounts = filteredAccounts.reduce(
      (acc, account) => {
        const gender = account.account_jenis_kelamin || "Tidak Diketahui"
        // Translate gender labels
        const genderLabel = gender === "L" ? "Laki-laki" : gender === "P" ? "Perempuan" : "Tidak Diketahui"
        acc[genderLabel] = (acc[genderLabel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const labels = Object.keys(genderCounts)
    const series = Object.values(genderCounts)

    if (labels.length === 0 || series.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && labels[config.dataPointIndex]) {
                const genderLabel = labels[config.dataPointIndex]
                // Convert back to original format for filtering
                const originalGender = genderLabel === "Laki-laki" ? "L" : genderLabel === "Perempuan" ? "P" : genderLabel
                const newGender = selectedGender === originalGender ? null : originalGender
                setSelectedGender(newGender)
                onFilterChange?.({ gender: newGender, grade: selectedGrade, unit: selectedUnit, age: selectedAge })
              }
            },
          },
        },
        labels,
        colors: ["#3B82F6", "#EC4899"],
        title: {
          text: "Distribusi Jenis Kelamin",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        legend: {
          position: "bottom" as const,
          fontSize: "12px",
          fontWeight: "500",
        },
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Total",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  formatter: () => filteredAccounts.length.toString(),
                },
                value: {
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#1F2937",
                },
              },
            },
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} pegawai`,
          },
          theme: "light",
        },
      },
    }
  }

  // Grafik Distribusi Umur
  const getAgeDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
  
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [{ name: "Pegawai", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }
  
    const ages = filteredAccounts
      .filter((account) => account.account_tanggal_lahir)
      .map((account) => calculateAge(account.account_tanggal_lahir))
  
    const ageRanges: Record<string, number> = {
      "20-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51-60": 0,
      "60+": 0,
    }
  
    ages.forEach((age) => {
      if (age >= 20 && age <= 30) ageRanges["20-30"]++
      else if (age >= 31 && age <= 40) ageRanges["31-40"]++
      else if (age >= 41 && age <= 50) ageRanges["41-50"]++
      else if (age >= 51 && age <= 60) ageRanges["51-60"]++
      else if (age > 60) ageRanges["60+"]++
    })
  
    const categories = Object.keys(ageRanges)
  
    return {
      series: [
        {
          name: "Pegawai",
          data: Object.values(ageRanges),
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const ageRange = categories[config.dataPointIndex]
                const newAge = selectedAge === ageRange ? null : ageRange
                setSelectedAge(newAge)
                onFilterChange?.({ 
                  gender: selectedGender, 
                  grade: selectedGrade, 
                  unit: selectedUnit,
                  age: newAge 
                })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            horizontal: true,
            barHeight: "70%",
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ["#fff"],
            fontWeight: "bold",
            fontSize: "12px",
          },
        },
        xaxis: {
          categories,
          labels: {
            style: {
              fontSize: "12px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Rentang Umur",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#10B981"],
        title: {
          text: "Distribusi Umur",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} pegawai`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Grafik Distribusi Golongan
  const getGradeDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [{ name: "Pegawai", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const gradeCounts = filteredAccounts.reduce(
      (acc, account) => {
        const grade = account.account_golongan || "Tidak Diketahui"
        acc[grade] = (acc[grade] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const categories = Object.keys(gradeCounts)
    const data = Object.values(gradeCounts)

    return {
      series: [
        {
          name: "Pegawai",
          data,
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const grade = categories[config.dataPointIndex]
                const newGrade = selectedGrade === grade ? null : grade
                setSelectedGrade(newGrade)
                onFilterChange?.({ gender: selectedGender, grade: newGrade, unit: selectedUnit, age: selectedAge })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: true,
            barHeight: "70%",
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ["#fff"],
            fontSize: "12px",
            fontWeight: "bold",
          },
        },
        xaxis: {
          categories,
          labels: {
            style: {
              fontSize: "11px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Tingkat Golongan",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Distribusi Golongan",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} pegawai`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Grafik Distribusi Unit
  const getUnitDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [{ name: "Pegawai", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const unitCounts = filteredAccounts.reduce(
      (acc, account) => {
        const unit = account.account_unit || "Tidak Diketahui"
        acc[unit] = (acc[unit] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const categories = Object.keys(unitCounts)
    const data = Object.values(unitCounts)

    return {
      series: [
        {
          name: "Pegawai",
          data,
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && categories[config.dataPointIndex]) {
                const unit = categories[config.dataPointIndex]
                const newUnit = selectedUnit === unit ? null : unit
                setSelectedUnit(newUnit)
                onFilterChange?.({ gender: selectedGender, grade: selectedGrade, unit: newUnit, age: selectedAge })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: true,
            columnWidth: "65%",
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: categories.map(unit => unit.length > 20 ? unit.substring(0, 20) + "..." : unit),
          labels: {
            rotate: -45,
            style: {
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Jumlah Pegawai",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#F59E0B"],
        title: {
          text: "Distribusi Unit",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} pegawai`,
          },
          theme: "light",
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
      },
    }
  }

  // Grafik Distribusi Jabatan
  const getPositionDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [{ name: "Pegawai", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 500 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }
  
    const positionCounts = filteredAccounts.reduce((acc, account) => {
      const positions = account.account_jabatan ?? []
    
      let latestPositionName = "Tidak Diketahui"
    
      if (positions.length > 0) {
        // Urutkan berdasarkan awal_menjabat, ambil yang terbaru
        const latest = [...positions].sort(
          (a, b) => new Date(b.awal_menjabat).getTime() - new Date(a.awal_menjabat).getTime()
        )[0]
    
        const name = latest.name
    
        // Pemetaan alias
        if (name.includes("Kepala")) {
          latestPositionName = "Pejabat Struktural"
        } else if (["Pemeriksa", "Pranata", "Ahli", "Muda"].some((keyword) =>
            name.includes(keyword)
        )) {
          latestPositionName = name  // tulis jabatan aslinya
        } else {
          latestPositionName = "Pelaksana"
        }
      }
    
      acc[latestPositionName] = (acc[latestPositionName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const categories = Object.keys(positionCounts)
    const data = Object.values(positionCounts)
  
    return {
      series: [
        {
          name: "Pegawai",
          data,
        },
      ],
      options: {
        chart: {
          type: "bar" as const,
          height: Math.max(400, categories.length * 35), // otomatis tinggi menyesuaikan jumlah jabatan
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 6,
            barHeight: "70%",
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ["#fff"],
            fontSize: "12px",
            fontWeight: "bold",
          },
        },
        xaxis: {
          categories,
          labels: {
            style: {
              fontSize: "12px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Jabatan",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#3B82F6"],
        title: {
          text: "Distribusi Jabatan",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} pegawai`,
          },
          theme: "light",
        },
        legend: {
          show: false,
        },
      },
    }
  }
  

  // Statistik Ringkasan
  const getSummaryStats = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        totalEmployees: 0,
        maleCount: 0,
        femaleCount: 0,
        avgAge: 0,
        uniqueUnits: 0,
      }
    }

    const totalEmployees = filteredAccounts.length
    const maleCount = filteredAccounts.filter((acc) => acc.account_jenis_kelamin === "L").length
    const femaleCount = filteredAccounts.filter((acc) => acc.account_jenis_kelamin === "P").length
    // Filter berdasarkan status kepegawaian
    const PNS = filteredAccounts?.length ? 
    filteredAccounts.filter((acc) => 
      acc.account_golongan && acc.account_golongan.toLowerCase().includes("golongan")
    ).length : 0
  
  const P3K = filteredAccounts?.length ? 
    filteredAccounts.filter((acc) => 
      acc.account_golongan && acc.account_golongan.toLowerCase().includes("p3k")
    ).length : 0
  
  const TTT = filteredAccounts?.length ? 
    filteredAccounts.filter((acc) => {
      if (!acc.account_golongan) return true;
      const golongan = acc.account_golongan.toLowerCase();
      return !golongan.includes("golongan") && !golongan.includes("p3k");
    }).length : 0

    const validAges = filteredAccounts
      .filter((acc) => acc.account_tanggal_lahir)      // pastikan ada tanggal lahir
      .map((acc) => calculateAge(acc.account_tanggal_lahir))
      .filter((age) => !isNaN(age) && age !== 100) // filter out error values
    const avgAge =
      validAges.length > 0 ? Math.round(validAges.reduce((sum, age) => sum + age, 0) / validAges.length) : 0

    const uniqueUnits = new Set(filteredAccounts.map((acc) => acc.account_unit).filter(Boolean)).size

    return {
      totalEmployees,
      maleCount,
      femaleCount,
      avgAge,
      uniqueUnits,
      PNS,
      P3K,
      TTT
    }
  }

  const stats = getSummaryStats()

  const clearFilters = () => {
    setSelectedGender(null)
    setSelectedGrade(null)
    setSelectedUnit(null)
    setSelectedAge(null)
    onFilterChange?.({ gender: null, grade: null, unit: null, age: null })
  }

  return (
    <div className="space-y-6">

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Pegawai</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
                <p className="text-xs text-blue-600 mt-1">Akun aktif</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Pegawai Laki-laki</p>
                <p className="text-2xl font-bold text-green-600">{stats.maleCount}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalEmployees > 0 ? ((stats.maleCount / stats.totalEmployees) * 100).toFixed(1) : 0}% dari total
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">Pegawai Perempuan</p>
                <p className="text-2xl font-bold text-pink-600">{stats.femaleCount}</p>
                <p className="text-xs text-pink-600 mt-1">
                  {stats.totalEmployees > 0 ? ((stats.femaleCount / stats.totalEmployees) * 100).toFixed(1) : 0}% dari
                  total
                </p>
              </div>
              <Users className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Rata-rata Umur</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgAge}</p>
                <p className="text-xs text-orange-600 mt-1">Tahun</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Baris ke 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">PNS</p>
                <p className="text-2xl font-bold text-blue-600">{stats.PNS}</p>
                {stats.totalEmployees > 0 ? ((stats.PNS / stats.totalEmployees) * 100).toFixed(1) : 0}% dari total
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">P3K</p>
                <p className="text-2xl font-bold text-green-600">{stats.P3K}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalEmployees > 0 ? ((stats.P3K / stats.totalEmployees) * 100).toFixed(1) : 0}% dari total
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">Tenaga Tidak Tetap</p>
                <p className="text-2xl font-bold text-pink-600">{stats.TTT}</p>
                <p className="text-xs text-pink-600 mt-1">
                 {stats.totalEmployees > 0 ? ((stats.TTT / stats.totalEmployees) * 100).toFixed(1) : 0}% dari total
                </p>
              </div>
              <Users className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>

     
      </div>

      {/* Baris Pertama - 3 Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribusi Jenis Kelamin */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-600" />
              Distribusi Jenis Kelamin
            </CardTitle>
            <CardDescription className="text-sm">
              Klik segmen untuk filter berdasarkan jenis kelamin. Grafik donat interaktif.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getGenderDistribution().options}
              series={getGenderDistribution().series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Distribusi Umur */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              Distribusi Umur
            </CardTitle>
            <CardDescription className="text-sm">Klik batang untuk filter berdasarkan rentang umur.</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAgeDistribution().options}
              series={getAgeDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Distribusi Golongan */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-purple-600" />
              Distribusi Golongan
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan tingkat golongan. Distribusi golongan pegawai.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getGradeDistribution().options}
              series={getGradeDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Baris Kedua - 2 Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Unit */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-orange-600" />
              Distribusi Unit
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan unit. Distribusi pegawai di berbagai departemen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getUnitDistribution().options}
              series={getUnitDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Distribusi Jabatan */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Distribusi Jabatan
            </CardTitle>
            <CardDescription className="text-sm">Distribusi pegawai di berbagai jabatan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getPositionDistribution().options}
              series={getPositionDistribution().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}