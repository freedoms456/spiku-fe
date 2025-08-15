"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Award, Calendar, BarChart3, Activity, Target } from "lucide-react"
import { accounts } from "@/lib/employee-management-data"
import dynamic from "next/dynamic"

interface AccountsAnalyticsProps {
  filteredAccounts?: any[]
  onFilterChange?: (filters: any) => void
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function AccountsAnalytics({
  filteredAccounts: propFilteredAccounts,
  onFilterChange,
}: AccountsAnalyticsProps = {}) {
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
    return age
  }

  // Get filtered accounts based on selections
  const getFilteredAccounts = () => {
    if (propFilteredAccounts) {
      return propFilteredAccounts
    }

    let filtered = accounts

    if (selectedGender) {
      filtered = filtered.filter((acc) => acc.account_jenis_kelamin === selectedGender)
    }

    if (selectedGrade) {
      filtered = filtered.filter((acc) => acc.account_golongan === selectedGrade)
    }

    if (selectedUnit) {
      filtered = filtered.filter((acc) => acc.account_unit === selectedUnit)
    }

    return filtered
  }

  // Gender Distribution Chart
  const getGenderDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "donut" as const, height: 350 },
          labels: [],
          noData: { text: "No data available" },
        },
      }
    }

    const genderCounts = filteredAccounts.reduce(
      (acc, account) => {
        const gender = account.account_jenis_kelamin || "Unknown"
        acc[gender] = (acc[gender] || 0) + 1
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
          noData: { text: "No data available" },
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
                const gender = labels[config.dataPointIndex]
                const newGender = selectedGender === gender ? null : gender
                setSelectedGender(newGender)
                onFilterChange?.({ gender: newGender, grade: selectedGrade, unit: selectedUnit })
              }
            },
          },
        },
        labels,
        colors: ["#3B82F6", "#EC4899"],
        title: {
          text: "Gender Distribution",
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
            formatter: (val: number) => `${val} employees`,
          },
          theme: "light",
        },
      },
    }
  }

  // Age Distribution Chart
  const getAgeDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [{ name: "Employees", data: [] }],
        options: {
          chart: { type: "column" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const ages = filteredAccounts
      .filter((account) => account.account_tanggal_lahir)
      .map((account) => calculateAge(account.account_tanggal_lahir))

    const ageRanges = {
      "20-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51-60": 0,
      "60+": 0,
    }

    ages.forEach((age) => {
      if (age <= 30) ageRanges["20-30"]++
      else if (age <= 40) ageRanges["31-40"]++
      else if (age <= 50) ageRanges["41-50"]++
      else if (age <= 60) ageRanges["51-60"]++
      else ageRanges["60+"]++
    })

    return {
      series: [
        {
          name: "Employees",
          data: Object.values(ageRanges),
        },
      ],
      options: {
        chart: {
          type: "column" as const,
          height: 350,
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            columnWidth: "75%",
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
          categories: Object.keys(ageRanges),
          labels: {
            style: {
              fontSize: "12px",
              fontWeight: "500",
            },
          },
        },
        yaxis: {
          title: {
            text: "Number of Employees",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#10B981"],
        title: {
          text: "Age Distribution",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} employees`,
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

  // Grade Distribution Chart
  const getGradeDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [{ name: "Employees", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const gradeCounts = filteredAccounts.reduce(
      (acc, account) => {
        const grade = account.account_golongan || "Unknown"
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
          name: "Employees",
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
                onFilterChange?.({ gender: selectedGender, grade: newGrade, unit: selectedUnit })
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
            text: "Grade Levels",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#8B5CF6"],
        title: {
          text: "Grade Distribution",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} employees`,
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

  // Unit Distribution Chart
  const getUnitDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [{ name: "Employees", data: [] }],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
          noData: { text: "No data available" },
        },
      }
    }

    const unitCounts = filteredAccounts.reduce(
      (acc, account) => {
        const unit = account.account_unit || "Unknown"
        const shortUnit = unit.length > 20 ? unit.substring(0, 20) + "..." : unit
        acc[shortUnit] = (acc[shortUnit] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const categories = Object.keys(unitCounts)
    const data = Object.values(unitCounts)

    return {
      series: [
        {
          name: "Employees",
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
                onFilterChange?.({ gender: selectedGender, grade: selectedGrade, unit: newUnit })
              }
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: false,
            columnWidth: "65%",
          },
        },
        dataLabels: {
          enabled: false,
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
            text: "Number of Employees",
            style: {
              fontWeight: "600",
            },
          },
        },
        colors: ["#F59E0B"],
        title: {
          text: "Unit Distribution",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} employees`,
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

  // Position Distribution Chart
  const getPositionDistribution = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [],
        options: {
          chart: { type: "pie" as const, height: 350 },
          labels: [],
          noData: { text: "No data available" },
        },
      }
    }

    const positionCounts = filteredAccounts.reduce(
      (acc, account) => {
        const position = account.account_jabatan || "Unknown"
        acc[position] = (acc[position] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const labels = Object.keys(positionCounts)
    const series = Object.values(positionCounts)

    return {
      series,
      options: {
        chart: {
          type: "pie" as const,
          height: 350,
        },
        labels,
        colors: ["#EF4444", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"],
        title: {
          text: "Position Distribution",
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
            formatter: (val: number) => `${val} employees`,
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

  // Age vs Grade Correlation
  const getAgeVsGradeCorrelation = () => {
    const filteredAccounts = getFilteredAccounts()
    if (!filteredAccounts || filteredAccounts.length === 0) {
      return {
        series: [{ name: "Employees", data: [] }],
        options: {
          chart: { type: "scatter" as const, height: 350 },
          noData: { text: "No data available" },
        },
      }
    }

    const correlationData = filteredAccounts
      .filter((account) => account.account_tanggal_lahir && account.account_golongan)
      .map((account) => ({
        x: calculateAge(account.account_tanggal_lahir),
        y: Number.parseInt(account.account_golongan.replace(/\D/g, "")) || 1,
        name: account.account_name || "Unknown",
      }))

    return {
      series: [
        {
          name: "Employees",
          data: correlationData,
        },
      ],
      options: {
        chart: {
          type: "scatter" as const,
          height: 350,
          toolbar: { show: false },
        },
        xaxis: {
          title: {
            text: "Age (Years)",
            style: {
              fontWeight: "600",
            },
          },
          min: 20,
          max: 65,
          labels: {
            style: {
              fontSize: "11px",
            },
          },
        },
        yaxis: {
          title: {
            text: "Grade Level",
            style: {
              fontWeight: "600",
            },
          },
          min: 1,
          max: 4,
          labels: {
            style: {
              fontSize: "11px",
            },
          },
        },
        colors: ["#06B6D4"],
        title: {
          text: "Age vs Grade Correlation",
          align: "center" as const,
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1F2937",
          },
        },
        tooltip: {
          custom: ({ series, seriesIndex, dataPointIndex, w }) => {
            if (dataPointIndex >= 0 && correlationData[dataPointIndex]) {
              const data = correlationData[dataPointIndex]
              return `<div class="p-3 bg-white border rounded-lg shadow-lg">
                <strong class="text-gray-800 text-sm">${data.name}</strong><br/>
                <span class="text-blue-600 text-xs">Age: ${data.x} years</span><br/>
                <span class="text-green-600 text-xs">Grade: ${data.y}</span>
              </div>`
            }
            return ""
          },
        },
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 3,
        },
        markers: {
          size: 6,
          strokeWidth: 2,
          strokeColors: "#fff",
          hover: {
            size: 8,
          },
        },
      },
    }
  }

  // Summary Statistics
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
    const maleCount = filteredAccounts.filter((acc) => acc.account_jenis_kelamin === "Laki-laki").length
    const femaleCount = filteredAccounts.filter((acc) => acc.account_jenis_kelamin === "Perempuan").length

    const validAges = filteredAccounts
      .filter((acc) => acc.account_tanggal_lahir)
      .map((acc) => calculateAge(acc.account_tanggal_lahir))

    const avgAge =
      validAges.length > 0 ? Math.round(validAges.reduce((sum, age) => sum + age, 0) / validAges.length) : 0

    const uniqueUnits = new Set(filteredAccounts.map((acc) => acc.account_unit).filter(Boolean)).size

    return {
      totalEmployees,
      maleCount,
      femaleCount,
      avgAge,
      uniqueUnits,
    }
  }

  const stats = getSummaryStats()

  const clearFilters = () => {
    setSelectedGender(null)
    setSelectedGrade(null)
    setSelectedUnit(null)
    onFilterChange?.({ gender: null, grade: null, unit: null })
  }

  return (
    <div className="space-y-6">
      {/* Filter Status */}
      {(selectedGender || selectedGrade || selectedUnit) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-blue-800">Active Filters:</span>
                {selectedGender && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    <Users className="w-3 h-3 mr-1" />
                    {selectedGender}
                  </Badge>
                )}
                {selectedGrade && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    Grade {selectedGrade}
                  </Badge>
                )}
                {selectedUnit && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                  >
                    <Target className="w-3 h-3 mr-1" />
                    {selectedUnit}
                  </Badge>
                )}
              </div>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="hover:bg-blue-100 transition-colors bg-transparent"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Employees</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
                <p className="text-xs text-blue-600 mt-1">Active accounts</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Male Employees</p>
                <p className="text-2xl font-bold text-green-600">{stats.maleCount}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalEmployees > 0 ? ((stats.maleCount / stats.totalEmployees) * 100).toFixed(1) : 0}% of total
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
                <p className="text-sm font-medium text-pink-700">Female Employees</p>
                <p className="text-2xl font-bold text-pink-600">{stats.femaleCount}</p>
                <p className="text-xs text-pink-600 mt-1">
                  {stats.totalEmployees > 0 ? ((stats.femaleCount / stats.totalEmployees) * 100).toFixed(1) : 0}% of
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
                <p className="text-sm font-medium text-orange-700">Average Age</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgAge}</p>
                <p className="text-xs text-orange-600 mt-1">Years old</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{stats.uniqueUnits}</p>
                <p className="text-xs text-purple-600 mt-1">Different units</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* First Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-600" />
              Gender Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Click segments to filter by gender. Interactive donut chart.
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

        {/* Age Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              Age Distribution
            </CardTitle>
            <CardDescription className="text-sm">Age groups of employees across the organization.</CardDescription>
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

        {/* Grade Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-purple-600" />
              Grade Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by grade level. Employee grade distribution.
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

      {/* Second Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unit Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-orange-600" />
              Unit Distribution
            </CardTitle>
            <CardDescription className="text-sm">
              Click bars to filter by unit. Employee distribution across departments.
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

        {/* Position Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Position Distribution
            </CardTitle>
            <CardDescription className="text-sm">Distribution of employees across different positions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getPositionDistribution().options}
              series={getPositionDistribution().series}
              type="pie"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Age vs Grade Correlation */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-cyan-50 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              Age vs Grade Correlation
            </CardTitle>
            <CardDescription className="text-sm">Correlation between employee age and grade level.</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={getAgeVsGradeCorrelation().options}
              series={getAgeVsGradeCorrelation().series}
              type="scatter"
              height={350}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
