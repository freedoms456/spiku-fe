"use client"

import { useState,useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Award, TrendingUp, Users, Star, Target, BarChart3, AlertTriangle } from "lucide-react"
import { accounts, educations } from "@/lib/employee-management-data"
import dynamic from "next/dynamic"

interface EducationAnalyticsProps {
  filteredEducations?: any[]
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function AnalitikPendidikan({
  filteredAccounts: propFilteredAccounts,
  onFilterChange,
}: EducationAnalyticsProps = {}) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)

  // Get filtered educations based on selections
  const getFilteredAccounts = useMemo(() => {
    
    let filtered = propFilteredAccounts
    

    return filtered
  }, [ propFilteredAccounts, selectedLevel, selectedMajor, selectedInstitution, accounts])


  // Education Level Distribution Chart
  const getEducationLevelDistribution = () => {
    const filteredEducations = getFilteredAccounts.flatMap((acc) => acc.account_pendidikan || []) 
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const levelCounts = filteredEducations.reduce(
      (acc, education) => {
        const level = education.jenjang || "Tidak Diketahui"
        acc[level] = (acc[level] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const labels = Object.keys(levelCounts)
    const series = Object.values(levelCounts)

    return {
      series,
      options: {
        chart: {
          type: "donut" as const,
          height: 350,
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && labels[config.dataPointIndex]) {
                const level = labels[config.dataPointIndex]
                const newLevel = selectedLevel === level ? null : level
                setSelectedLevel(newLevel)
                onFilterChange?.({ level: newLevel, major: selectedMajor, institution: selectedInstitution })
              }
            },
          },
        },
        labels,
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
        title: {
          text: "Distribusi Jenjang Pendidikan",
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
                  formatter: () => filteredEducations.length.toString(),
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

  // Most Common Majors Chart
  const getMostCommonMajors = () => {
    const filteredEducations = getFilteredAccounts
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [{ name: "Pegawai", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const majorCounts = filteredEducations
    .flatMap((acc) => acc.account_pendidikan || []) // ambil semua pendidikan
    .reduce((acc, education) => {
      const major = education.jurusan || "Tidak Diketahui"
      acc[major] = (acc[major] || 0) + 1
      return acc
    }, {} as Record<string, number>)
      const sortedMajors = Object.entries(majorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)

    const categories = sortedMajors.map(([major, _]) => major)
    const data = sortedMajors.map(([_, count]) => count)

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
                const major = categories[config.dataPointIndex]
                const newMajor = selectedMajor === major ? null : major
                setSelectedMajor(newMajor)
                onFilterChange?.({ level: selectedLevel, major: newMajor, institution: selectedInstitution })
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
            text: "Jurusan",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#10B981"],
        title: {
          text: "Jurusan Paling Populer",
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

  // Graduation Year Distribution Chart
  const getGraduationYearDistribution = () => {
   
   
    const filteredEducations = getFilteredAccounts.flatMap((acc) => acc.account_pendidikan || [])
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        series: [{ name: "Lulusan", data: [] }],
        options: {
          chart: { type: "line" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }

    const yearCounts = filteredEducations.reduce(
      (acc, education) => {
        const year = education.tahun_lulus || "Tidak Diketahui"
        acc[year] = (acc[year] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedYears = Object.entries(yearCounts).sort((a, b) => a[0].localeCompare(b[0]))
    const categories = sortedYears.map(([year, _]) => year)
    const data = sortedYears.map(([_, count]) => count)

    return {
      series: [
        {
          name: "Lulusan",
          data,
        },
      ],
      options: {
        chart: {
          type: "line" as const,
          height: 350,
          toolbar: { show: false },
        },
        stroke: {
          curve: "smooth" as const,
          width: 4,
        },
        markers: {
          size: 8,
          hover: {
            size: 12,
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
            text: "Jumlah Lulusan",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Distribusi Tahun Kelulusan",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} lulusan`,
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


  // Top Institutions Chart
  const getTopInstitutions = () => {
    const accounts = getFilteredAccounts // pastikan ini function
    if (!accounts || accounts.length === 0) {
      return {
        series: [{ name: "Alumni", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "Tidak ada data tersedia" },
        },
      }
    }
  
    // hitung institusi
    const institutionCounts = accounts
      .flatMap((acc) => acc.account_pendidikan || [])
      .reduce((acc, education) => {
        const institution = education.institusi?.trim() || "Tidak Diketahui"
        acc[institution] = (acc[institution] || 0) + 1
        return acc
      }, {} as Record<string, number>)
  
    // sort top 6
    const sortedInstitutions = Object.entries(institutionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  
    const categories = sortedInstitutions.map(([institution]) =>
      institution.length > 15 ? institution.substring(0, 15) + "..." : institution,
    )
    const data = sortedInstitutions.map(([_, count]) => count)
  
    return {
      series: [{ name: "Alumni", data }],
      options: {
        chart: {
          type: "bar" as const,
          height: 350,
          toolbar: { show: false },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              if (config && config.dataPointIndex >= 0 && sortedInstitutions[config.dataPointIndex]) {
                const institution = sortedInstitutions[config.dataPointIndex][0]
                const newInstitution = selectedInstitution === institution ? null : institution
                setSelectedInstitution(newInstitution)
                onFilterChange?.({ level: selectedLevel, major: selectedMajor, institution: newInstitution })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: false,
            columnWidth: "70%",
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
            rotate: -45,
            style: {
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Jumlah Alumni",
            style: { fontWeight: "600" },
          },
        },
        colors: ["#F59E0B"],
        title: {
          text: "Institusi Teratas",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} alumni`,
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

  // Multiple Degrees Chart
  const getMultipleDegreesChart = () => {
    const accountsToUse = getFilteredAccounts
    if (!accountsToUse || accountsToUse.length === 0) {
      return {
        series: [],
        options: { chart: { type: "pie" as const, height: 350 }, labels: [], noData: { text: "Tidak ada data tersedia" } },
      }
    }
  
    const validLevels = ["S1", "S2", "S3"]
  
    // Hitung jumlah pendidikan valid tiap pegawai
    const employeeEducationCount = accountsToUse.map((account) => ({
      name: account.account_name || "Tidak Diketahui",
      count: (account.account_pendidikan || []).filter((edu:any) => validLevels.includes(edu.jenjang)).length,
    }))
  
    const singleDegree = employeeEducationCount.filter(emp => emp.count === 1).length
    const multipleDegrees = employeeEducationCount.filter(emp => emp.count > 1).length

    return {
      series: [singleDegree, multipleDegrees],
      options: {
        chart: {
          type: "pie" as const,
          height: 350,
        },
        labels: ["Gelar Tunggal", "Gelar Berganda"],
        colors: ["#3B82F6", "#EF4444"],
        title: {
          text: "Pegawai dengan Gelar Berganda",
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
        tooltip: {
          y: {
            formatter: (val: number) => `${val} pegawai`,
          },
          theme: "light",
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "12px",
            fontWeight: "bold",
            colors: ["#fff"],
          },
        },
      },
    }
  }

  // Summary Statistics
  const getSummaryStats = () => {
    const filteredEducations = getFilteredAccounts.flatMap((acc) => acc.account_pendidikan || []) 
    if (!filteredEducations || filteredEducations.length === 0) {
      return {
        totalEducations: 0,
        uniqueInstitutions: 0,
        avgGPA: "0.00",
        highGPACount: 0,
        multipleDegreesCount: 0,
      }
    }

    const totalEducations = filteredEducations.length
    const uniqueInstitutions = new Set(filteredEducations.map((edu) => edu.institusi).filter(Boolean)).size

    const validGPAs = filteredEducations
    .map((edu) => Number.parseFloat((edu.gpa || "").toString().replace(",", ".")))
    .filter((gpa) => !isNaN(gpa))

    const avgGPA =
      validGPAs.length > 0 ? (validGPAs.reduce((sum, gpa) => sum + gpa, 0) / validGPAs.length).toFixed(2) : "0.00"

      
      const highGPACount = filteredEducations.filter((edu) => {
        const gpa = parseFloat((edu.gpa || "").replace(",", "."))
        return !isNaN(gpa) && gpa > 3.5
      }).length

    const accountsToUse = propFilteredAccounts || accounts
    const multipleDegreesCount = accountsToUse.filter(
      (acc) => educations.filter((edu) => edu.account_id === acc.id).length > 1,
    ).length

    return {
      totalEducations,
      uniqueInstitutions,
      avgGPA,
      highGPACount,
      multipleDegreesCount,
    }
  }

  const stats = getSummaryStats()

  const clearFilters = () => {
    setSelectedLevel(null)
    setSelectedMajor(null)
    setSelectedInstitution(null)
    onFilterChange?.({ level: null, major: null, institution: null })
  }

  return (
    <div className="space-y-6">
    

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Rekaman</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEducations}</p>
                <p className="text-xs text-blue-600 mt-1">Data pendidikan</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Institusi</p>
                <p className="text-2xl font-bold text-green-600">{stats.uniqueInstitutions}</p>
                <p className="text-xs text-green-600 mt-1">Sekolah berbeda</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">IPK Rata-rata</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgGPA}</p>
                <p className="text-xs text-purple-600 mt-1">Rata-rata keseluruhan</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">IPK Tinggi &gt;3.5</p>
                <p className="text-2xl font-bold text-orange-600">{stats.highGPACount}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {stats.totalEducations > 0 ? ((stats.highGPACount / stats.totalEducations) * 100).toFixed(1) : 0}% dari
                  total
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">Gelar Berganda</p>
                <p className="text-2xl font-bold text-pink-600">{stats.multipleDegreesCount}</p>
                <p className="text-xs text-pink-600 mt-1">Pegawai</p>
              </div>
              <Users className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* First Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Education Level Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Distribusi Jenjang Pendidikan
            </CardTitle>
            <CardDescription className="text-sm">
              Klik segmen untuk filter berdasarkan jenjang pendidikan. Menampilkan distribusi gelar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getEducationLevelDistribution().options}
              series={getEducationLevelDistribution().series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Most Common Majors */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
              Jurusan Paling Populer
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan jurusan. Menampilkan 8 bidang studi teratas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getMostCommonMajors().options}
              series={getMostCommonMajors().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

       
      </div>

      {/* Second Row - 3 Charts */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Graduation Year Distribution */}
         <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Tren Tahun Kelulusan
            </CardTitle>
            <CardDescription className="text-sm">Timeline yang menunjukkan pola kelulusan selama bertahun-tahun.</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getGraduationYearDistribution().options}
              series={getGraduationYearDistribution().series}
              type="line"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Top Institutions */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-orange-600" />
              Institusi Teratas
            </CardTitle>
            <CardDescription className="text-sm">
              Klik batang untuk filter berdasarkan institusi. Menampilkan 6 universitas/perguruan tinggi teratas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getTopInstitutions().options}
              series={getTopInstitutions().series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Insights Panel */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Wawasan & Rekomendasi Pendidikan
          </CardTitle>
          <CardDescription>Wawasan berbasis data dari analitik pendidikan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <h4 className="font-semibold text-gray-900">Keunggulan Akademik</h4>
              </div>
              <p className="text-sm text-gray-700">
                {stats.totalEducations > 0 ? ((stats.highGPACount / stats.totalEducations) * 100).toFixed(1) : 0}% dari
                pegawai memiliki IPK tinggi &gt;3.5
              </p>
              <p className="text-xs text-gray-500 mt-1">Fondasi akademik yang kuat dalam tenaga kerja</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-green-500" />
                <h4 className="font-semibold text-gray-900">Keberagaman Pendidikan</h4>
              </div>
              <p className="text-sm text-gray-700">Alumni dari {stats.uniqueInstitutions} institusi yang berbeda</p>
              <p className="text-xs text-gray-500 mt-1">Latar belakang pendidikan yang beragam</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <h4 className="font-semibold text-gray-900">Pembelajaran Berkelanjutan</h4>
              </div>
              <p className="text-sm text-gray-700">{stats.multipleDegreesCount} pegawai memiliki gelar berganda</p>
              <p className="text-xs text-gray-500 mt-1">Komitmen untuk pembelajaran seumur hidup</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}